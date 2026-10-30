import * as userRepository from '../../user/repository/user.repository.js';
import {userNotExist} from "../../user/errors.js";
import * as messageRepository from '../../message/repository/message.repository.js';
import {AppError} from "../../../lib/error/error.js";

export async function sendMessage(content, receiver, sender) {
    // 1. check receiver exists
    const user = await userRepository.findUSerById(receiver);
    if (!user) throw userNotExist;
    // 2. save message into DB
    return await messageRepository.createMessage(content, receiver, sender);
}


export async function getAllMessages(userId) {
    const messages = await messageRepository.getAllMessages(userId) // [{},{},{}]  | []
    if(messages.length === 0) throw new AppError('no messages found', 404);
    return messages;
}