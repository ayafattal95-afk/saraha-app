import {withCache} from "../../lib/cache/withCache.js";
import {User} from "./model/user.model.js";
import {Router} from 'express';
import {uploadFilesArray, uploadSingleFile} from "../../pkg/media/multer.js";
import {allowedFields, fileValidation} from "../../pkg/media/file.validation.js";
import {authGuard} from "../../lib/auth/guard.js";
import * as userController from "./controller/user.controller.js";
import {adminGuard} from '../../lib/auth/admin.guard.js'

const userRouter = Router()

userRouter.get('/get-all-users',
    withCache(),
    async (req, res) => {
        const users = await User.find();
        res.json(users); // cache + send response
    }
)

userRouter.post('/upload-profile-pic',
    (req, res, next) => {
        console.log('1 - Request received');
        next();
    },
    authGuard,
    uploadSingleFile('pp'),
    fileValidation(),
    userController.uploadProfilePic
);

userRouter.post('/upload-cv',
    uploadSingleFile('cv',
        allowedFields.files),
    fileValidation(allowedFields.files),
    (req, res, next) => {
    res.json('ok')
});

userRouter.post('/upload-cover-images', uploadFilesArray('cover-images', 3), (req, res, next) => {
    console.log(req.files);
    res.json('ok')
});

userRouter.patch('/ban/:userId', authGuard, adminGuard, userController.banUser);


export default userRouter;