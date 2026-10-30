import * as authRepository from '../repository/auth.repository.js';
import * as otpRepository from '../repository/otp.repository.js';
import * as userRepository from '../../user/repository/user.repository.js'
import {sendEmail} from "../../../lib/email/nodemailer.js";
import {toMs, toSeconds} from "../../../pkg/utils/time.js";
import {otpExpired, invalidCode, invalidPassword} from "../errors.js";
import {userAlreadyVerified, userNotExist, userAlreadyExists, userNotVerified} from "../../user/errors.js";
import {generateOTPCode} from "../../../lib/utils/otp.js";
import crypto from 'node:crypto';
import {logger} from "../../../pkg/logger/logger.js";
import {comparePassword, hashPassword} from "../utils/hash.js";
import {OAuth2Client} from "google-auth-library";
import {verifyGoogleToken} from "../../../lib/utils/google-auth.js";
import {mailjetProvider} from "../../../lib/email/int.js";
import {cacheProvider} from "../../../lib/cache/init.js";
import {generateAccessToken, generateRefreshToken, generateToken} from '../utils/token.js';
import {AppError} from "../../../lib/error/error.js";
import {verifyRefreshToken} from "../utils.js";

// base function
export async function baseFunction (email, code, factory) {
    // 1. check user existence
    const user = await authRepository.checkUserExistByEmail(email);
    // 1.1 if you don't exist >> error "User not exist."
    if (!user) throw userNotExist;
    // 2. check otp validation
    const cashedCode = await cacheProvider.get(`otp:${email}`);  // {code, email} | null
    // 2.1 not exist into DB >> error >> "otp expired" >> resend otp
    if (!cashedCode) throw otpExpired
    // 2.2 otp stored into DB >> code not equal code stored >> error >> 'Invalid otp'
    if (cashedCode !== code) throw invalidCode;
    // 3. Switch you isVerified to true [update user]
    const result = await factory(user);
    // 4. delete otp from DB
    await cacheProvider.del(`otp:${email}`);
    return result;
}

export async function register(userData) {
    // 1. check user existence
    const userExists = await authRepository.checkUserExistByEmail(userData.email);
    logger.debug('user exist', { userExists });
    // 2. if yes, throw an error
    if (userExists) throw userAlreadyExists
    // 3. prepare data [hash-password]
    userData.password = await hashPassword(userData.password);
    // 4. save user into DB -> isVerified: false
    const createdUser = await authRepository.createUser(userData);
    // 5. generate and save otp into DB
    const code = generateOTPCode();
    // logger.info(code);
    // await otpRepository.createOTP({
    //     code:code,
    //     email: userData.email,
    //     expiresAt: Date.now(Date.now() + toMs(5, 'minutes')),
    // });
    await cacheProvider.set(`otp:${userData.email}`, code, toSeconds(3, 'minutes'))
    // 6. send email verification OTP
    await mailjetProvider.sendMail(
        userData.email,
        'verification code',
        `<h1>Your verification code is ${code} </h1>`
    );
    return createdUser;
}

// export async function verifyAccount (email, code) {
//     // 1. check user existence
//     const user = await authRepository.checkUserExistByEmail(email);
//     // 1.1 if you don't exist >> error "User not exist."
//     if (!user) throw userNotExist;
//     // 1.2 if isVerified = true >> error "You already verified"
//     if (user['isVerified'] === true) throw userAlreadyVerified;
//     // 2. check otp validation
//     const cashedCode = await cacheProvider.get(`otp:${email}`);  // {code, email} | null
//     // 2.1 not exist into DB >> error >> "otp expired" >> resend otp
//     if (!cashedCode) throw otpExpired
//     // 2.2 otp stored into DB >> code not equal code stored >> error >> 'Invalid otp'
//     if (cashedCode !== code) throw invalidCode;
//     // 3. Switch you isVerified to true [update user]
//     const updatedUser = await userRepository.updateUserByEmail(email, {isVerified: true});
//     // 4. delete otp from DB
//     await cacheProvider.del(`otp:${email}`);
//
//     return updatedUser;
// }

export async function verifyAccount (email, code) {
  return await baseFunction(email, code, async () => {
        await userRepository.updateUserByEmail(email, {isVerified: true});
    });
}

export async function enable2stepVerification (email, code) {
   await baseFunction(email, code, async () => {
        await userRepository.updateUserByEmail(email, {twoStepVerification: true});
    })
}

export async function verifyCodeToLogin (email, code) {
    const { accessToken, refreshToken } = await baseFunction(email, code, async (user) => {
        const jti = crypto.randomUUID()
        const accessToken = generateAccessToken({sub: user._id, name: user.name});
        const refreshToken = generateRefreshToken({jti: jti, sub:user._id, name: user.name});
        await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));
        return {
            accessToken,
            refreshToken,
        }
    });
    return { accessToken, refreshToken };
}

export async function login (email, password) {
    let cachedTries = await cacheProvider.get(`login-tries:${email}`);
    if (cachedTries === '0') throw new AppError('Too Many Requests To Login', 429);

    // 1. check user existence
    const user = await authRepository.checkUserExistByEmail(email); // {} | null
    // 1.1 not exist
    if (!user) throw userNotExist;
    if (user.isBanned) throw new AppError('your account has banned', 403)
    // 1.2 not verified
    if(user.isVerified === false) throw userNotVerified;
    // 2. compare password
    const match = await comparePassword(password, user.password);
    if(!match) throw invalidPassword;

    if (user.twoStepVerification == true) {
        const code = generateOTPCode();
        await cacheProvider.set(`otp:${email}`, code, toSeconds(3, 'minutes'));
        await mailjetProvider.sendMail(email, '2 step verification email code', `<h3>your OTP to Login is ${code}</h3>`)
        return;
    }
    // 3. generate access Token
    const jti = crypto.randomUUID()
    const accessToken = generateAccessToken({sub: user._id, name: user.name});
    const refreshToken = generateRefreshToken({jti: jti, sub:user._id, name: user.name});
    await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));

    // set into cache >> 4 tries
    let cachedTTL = await cacheProvider.ttl(`login-tries:${email}`);
    cachedTries = cachedTries ?? 4;
    const ttl = cachedTTL == -2 ? toSeconds(3, 'minutes') : cachedTTL;
    await cacheProvider.set(`login-tries:${email}`, cachedTries - 1, ttl);


    return {
        accessToken,
        refreshToken,
    }
}

export async function sendOtp(email) {
    // 1. check user existence
    const user = await authRepository.checkUserExistByEmail(email);
    if (!user) throw userNotExist;
    // 2. delete all old OTPs
    // await otpRepository.deleteOTPsByEmail(email);
    // 3. generate OTP and save it into DB
    const code = generateOTPCode();
    // await otpRepository.createOTP({
    //     code:code,
    //     email: email,
    //     expiresAt: Date.now() + toMs(3, 'minutes'),
    // });
    await cacheProvider.set(`otp:${email}`, code, toSeconds(3, 'minutes'));
    // 4. send otp email
    const result = await mailjetProvider.sendMail(user.email, 'new OTP', `<h1>you new otp is ${code}</h1>`);

    console.log('Mailjet response:', result.body);
}

export async function  resetPassword (email, code, newPassword) {
    // 1. verify otp code
   const otp = await otpRepository.getOtpByEmail(email); // {} | null
    if (!otp) throw otpExpired;
    if (otp.code !== code) throw invalidCode;
    // 2. hash password
    const hashedPassword = await hashPassword(newPassword);
    // 3. update user password
    await userRepository.updateUserByEmail(email, {password: hashedPassword});
    // 4. delete otp
    await otpRepository.deleteOTPsByEmail(email);
}

export async function loginWithGoogle(idToken) {
    // 1. verify idToken >> jvodjfoivjgoijvoresihoufjpreoksf'pocjkproeifjupoeusjrhpf
    const payload = await verifyGoogleToken(idToken);
    // 2. check user exists
    const user = await authRepository.checkUserExistByEmail(payload.email);
    // 3. if exists >> generate Token
    if(user) {
        return generateToken({
            id: user._id,
            email: user.email,
        });
    }
    // 4. if not exist create user >> generate Token
    const createdUser = await authRepository.createUser({
        name: payload.name,
        email: payload.email,
        provider : 'google',
        isVerified: true,
    });
    return generateToken({
        id: createdUser._id,
        email: createdUser.email,
    });
}

export async function refreshTokenFn(token) {
    // 1. verify refresh token
    const payload = verifyRefreshToken(token);
    // 2. token used before
    const tokenId = await cacheProvider.get(`refreshToken:${payload.jti}`);
    if (!tokenId) throw new AppError('Used refresh token', 400);

    // 2. generate access token
    const jti = crypto.randomUUID();

    const accessToken = generateAccessToken({ id: payload.id, name: payload.name });
    // 3. generate refresh token
    const refreshToken = generateRefreshToken({ jti: jti, id: payload.id, name: payload.name });

    await cacheProvider.del(`refreshToken:${tokenId}`);
    await cacheProvider.set(`refreshToken:${jti}`, jti, toSeconds(7, 'days'));

    return {
        accessToken,
        refreshToken
    }
}


