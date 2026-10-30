import {Router} from 'express';
import * as authController from './controller/auth.controller.js';
import {idempotency} from "../../lib/idempotency/idempotency.js";
import {enable2stepVerification} from "./controller/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.patch('/verfiy-account', authController.verifyAccount);
authRouter.post('/login', authController.login);
authRouter.post('/send-otp', authController.sendOtp);
authRouter.patch('/reset-password', idempotency(), authController.resetPassword);
authRouter.post('/login-with-google', authController.loginWithGoogle);
authRouter.post('/refresh-token', authController.refreshTokenFn);
authRouter.patch('/enable-2-step-verification', authController.enable2stepVerification)
authRouter.post('/verify-to-login', authController.verifyCodeToLogin)


export default authRouter;