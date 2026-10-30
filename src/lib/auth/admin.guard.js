import {AppError} from "../error/error.js";
import {User} from "../../app/user/model/user.model.js";

export async function adminGuard(req, res, next) {
    try {
        const user = await User.findOne({
            _id: req.user.sub,
            isDeleted: false,
            isBanned: false
        });
        if (!user || user.role !== 'admin') {
            throw new AppError('Admin access only', 403);
        }

        next();
    } catch (err) {
        next(err);
    }

}
