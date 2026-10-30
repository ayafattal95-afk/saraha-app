import argon2 from 'argon2';
import jwt from "jsonwebtoken";
import { toMs } from "../../pkg/utils/time.js";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../../lib/error/error.js";
import { env } from "../../lib/config/env.js";

export async function hashPassword(password) {
    return argon2.hash(password);
}


export async function comparePassword(password, hashedPassword) {
    return argon2.verify(hashedPassword, password);
}

export function generateAccessToken(payload) {
    return jwt.sign(payload, 'fhaisbverflsdugjhbferfzdjgh', { expiresIn: toMs(1, 'hours') });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, 'fegrtnjogbfijkfbgorbtfdijbggidfsh', { expiresIn: toMs(7, 'days') });
}

// at the start of Application
// todo: Single Tone Design Pattern into
const client = new OAuth2Client();

export async function verifyGoogleToken(idToken) {
    try {

        const ticket = await client.verifyIdToken({
            idToken: idToken,// noon - facebook - amazon - Instagram - ngl-app-5
            audience: [env.google.webClientId]// ngl-app-5
        });
        return ticket.getPayload();// {id,name,email,pp}
    } catch (err) {
        throw new AppError('invalid google Token', 403);
    }
}


export function verifyRefreshToken(token) {
    return jwt.verify(token, 'fegrtnjogbfijkfbgorbtfdijbggidfsh');
}

export function setCookies(res, accessToken, refreshToken) {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        maxAge: toMs(1, 'hours'),
        path: "/"
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        maxAge: toMs(7, 'days'),
        path: '/api/auth/refresh-token'
    });
}