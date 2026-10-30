import * as authService from "../service/auth.service.js";
import {toMs} from "../../../pkg/utils/time.js";
import {validateBody} from "../../../lib/validation/validation.js";
import {loginDTO, registerDTO, resetPasswordDTO, sendOTPDto, verifyAccountDTO} from "../dto/auth.dto.js";
import {setCookies} from "../utils.js";

export async function register (req,res,next){
    try{
        // add layer of validation >> throw errors
       const data = validateBody(registerDTO, req.body);
        console.log(data);

        const createdUser = await authService.register(data);
        res.status(201).json({
            message: 'User created successfully.',
            success: true,
            data: createdUser
        });
    }catch(err){
        next(err);
    }
}

export async function verifyAccount(req,res,next){
    try{
        const data = validateBody(verifyAccountDTO, req.body);
        const {email, code} = data;
        const updatedUser = await authService.verifyAccount(email, code);
        res.status(201).json({
            message: 'User verified successfully.',
            success: true,
            data: updatedUser
        })
    }catch(err){
        next(err);
    }
}

export async function login (req,res,next){
    try{
        const data = validateBody(loginDTO, req.body);
        const {email, password} = data;
        const tokens = await authService.login(email, password);

        if (!tokens) {
            return res.json({message: "check your inbox, we sent OTP",
            success: true
            });
        }
        setCookies(res,tokens.accessToken, tokens.refreshToken)
        res.json({
            message: 'User login successfully.',
            success: true
        });
    }catch(err){
        next(err);
    }
}

export async function verifyCodeToLogin (req,res,next) {
    try{
        const { email, code } = req.body
        const { accessToken, refreshToken } = await authService.verifyCodeToLogin(email, code);

        setCookies(res, accessToken, refreshToken)

        res.json({message: "login successfully",
        success: true});
    }catch (error){
        next(error)
    }
}

export async function sendOtp (req,res,next){
    try{
        const data = validateBody(sendOTPDto, req.body);
        const {email} = data;
        await authService.sendOtp(email);
        res.status(201).json({
            message: 'new otp sent, check user email',
            success: true,
        });
    }catch(err){
        next(err);
    }
}

export async function enable2stepVerification (req,res,next){
    try {
        const {email, code} = req.body;
        await authService.enable2stepVerification(email, code);
        res.json({message: "enable 2 step verification successfully" , success:true})
    }catch(error){
        next(error);
    }
}

export async function resetPassword (req,res,next){
    try{
        const data = validateBody(resetPasswordDTO, req.body);
        const {email, code, newPassword} = data;
        await authService.resetPassword(email, code, newPassword);
        res.status(200).json({
            message: 'Password reset successfully.',
            success: true,
        });
    }catch(err){
        next(err);
    }
}

export async function loginWithGoogle (req,res,next){
    try{
        const token = await authService.loginWithGoogle(req.body.idToken);
        res.cookie('access_token', token, {
            httpOnly: true, maxAge: toMs (1, 'hours'),
        });
        res.json({message: 'User login successfully.',success: true});
    }catch(err){
        next(err);
    }
}

export async function refreshTokenFn(req, res, next) {
    try {
        const { accessToken, refreshToken } = await authService.refreshTokenFn(req.cookies.refresh_token);

        setCookies(res, accessToken, refreshToken)
        res.json({
            message: "refresh token successfully", success: true
        });
    } catch (error) {
        next(error)
    }
}