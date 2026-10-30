import  multer, {diskStorage} from 'multer';
import crypto from 'node:crypto';
import {AppError} from "../../lib/error/error.js";
import {allowedFields} from "./file.validation.js";

// storage;
// 1. disk [hdd]
//       folder >>
//       filename >>
// 2. memory [ram]

function multerUpload(allowedTypes = allowedFields.image) {
   return  multer({
       fileFilter: function (req, file, cb) {
           if (!allowedTypes.includes(file.mimetype)) {
              return  cb(new AppError('invalid file format', 400), false)
           }
           cb(null, true);
       },
        storage: diskStorage({
            destination: 'uploads',
            filename: function (req, file, cb) {
                cb(null, `${crypto.randomUUID()}-${file.originalname}`)
            }
        })
    })
}


export function uploadSingleFile(filedName, allowedTypes = allowedFields.image){
    return multerUpload(allowedTypes).single(filedName);
}

export function uploadFilesArray(filedName, maxCount){
    return multerUpload().array(filedName, maxCount);
}

export function uploadFields(fields) {
    return multerUpload().fields(fields);
}
