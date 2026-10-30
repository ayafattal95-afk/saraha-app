import {z} from "zod";
import {AppError} from "../error/error.js";


export function validateBody (dto, body) {
    const result = z.safeParse(dto, body);  // return {success: false, errors: []}
    if (result.success === false) {
        const errMessages = result.error.issues.map(issue => `${issue.path[0]?? 'error'} ${issue.message}`)
        throw new AppError(errMessages.join(', '), 400)
    }
    return result.data;  // body after modify
}

// result.error.issues >>
// [
// {message:"is required", path:['email']}
// {message:"is required", path:['name']}
// {path:['password'], message:"must be >= 3"}
// ]
// ! >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>after map
// [
// 'email : is required',
// 'name: is required',
// 'password: must be >= 8'
// ]
// !>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>after join()
// 'email : is required', 'name: is required', 'password: must be >= 8'