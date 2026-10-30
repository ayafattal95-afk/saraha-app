import * as userService from '../service/user.service.js'

export const uploadProfilePic = async (req, res, next) => {
    try{
       await userService.uploadProfilePic(req.user.id, req.file);
        res.json({message: "upload profile successfully." ,
            success: true
        });
    }catch(err){
        next(err);
    }
}

export const banUser = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const user = await userService.banUser(userId);
        res.status(200).json({
            message: "User banned successfully",
            success: true,
            data: user
        });
    }catch(err){
        next(err);
    }
}