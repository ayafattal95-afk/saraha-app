import jwt from 'jsonwebtoken';
import {env} from "../../../lib/config/env.js";//  import jwt from 'jsonwebtoken';
//  import {toMs} from "../../../pkg/utils/time.js";
//  import {env} from "../../../lib/config/env.js";
//
// export function generateToken(payload) {
//     return jwt.sign(
//         payload,
//         env.jwt.secret,
//         { expiresIn: toMs(1, 'hours')}
//     );
// }

export function generateToken(payload, expiresIn) {
    return jwt.sign(
        payload,
        env.jwt.secret,
        { expiresIn }
    );
}

export function generateAccessToken(payload) {
    return generateToken(payload, '15m');
}

export function generateRefreshToken(payload) {
    return generateToken(payload, '7d');
}
