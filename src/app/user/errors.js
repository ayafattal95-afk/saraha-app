import {AppError} from "../../lib/error/error.js";

export  const userNotExist = new AppError('User does not exist', 404);
export const userAlreadyVerified = new AppError('User already verified', 409);
export const userAlreadyExists = new AppError('user already exists', 409);
export const userNotVerified = new AppError('user Not Verified', 403);