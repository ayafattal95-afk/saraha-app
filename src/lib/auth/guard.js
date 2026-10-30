import jwt from 'jsonwebtoken'
import {env} from '../config/env.js'
import {AppError} from "../error/error.js";
import {User} from "../../app/user/model/user.model.js";

export async function authGuard(req, res, next)  {
    try{
        // logic of check token
        const token = req.cookies.access_token;
        if (!token) throw new AppError ('no token provided', 401);
        req.user = jwt.verify(token, env.jwt.secret);
        // req.user = payload;
        const user = await User.findOne({
            _id: req.user.sub,
            isDeleted:false
        });
        if (!user) throw new AppError('user not found', 403);
        if (user.isBanned) throw new AppError('Your account has been banned', 403);

       return  next();
    }catch(err){
        next(err)
    }
}