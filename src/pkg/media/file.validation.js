import {fileTypeFromBuffer} from 'file-type';
import fs from "node:fs";
import {AppError} from "../../lib/error/error.js";

export const allowedFields = {
    image: ['image/png', 'image/jpeg'],
    files: ['application/pdf', 'application/msword'],
    video: ['video/mp4'],
    audio: ['audio/mp3'],
}

// Middleware to validate file type by magic number (file signatures)
export const fileValidation = (allowedTypes = allowedFields.image) =>
    async (req, res, next) => {
    try {if(req.file.size > 5 * 1024 * 1024){
        throw new AppError('exceeded size allowed', 400);
    }
        // get the file path
        const filePath = req.file.path;
        // read the file and return buffer
        const buffer = fs.readFileSync(filePath);
        // get the file type
        const type = await fileTypeFromBuffer(buffer);
        // validate
        if (!type || !allowedTypes.includes(type.mime)) {
            fs.unlinkSync(filePath);
            return next(new AppError("Invalid file type", 400));
        }

        return next();
    }catch(error){
        return next(error);
    }
};