import {Message} from "../model/message.model.js";
import {RequestModel} from "../../../lib/db/requests.js";

export async function createMessage (content, receiver, sender) {
    return Message.create({
        content: content,
        sender: sender, // undefined
        receiver: receiver,
    })

}

export async function getAllMessages(userId) {
    const messages = await Message.find({
        receiver: userId
    });

    for (const message of messages) {
        if (!message.sender) continue;

        const request = await RequestModel.findOne({
            messageId: message._id,
            senderOfReq: userId,
            receiverOfReq: message.sender,
            status: 'accept'
        });

        if (request) {
            await message.populate({
                path: 'sender',
                select: 'name'
            });
        } else {
            message.sender = null;
        }
    }

    return messages;
}

export async function getMessageById(messageId) {
    return Message.findById(messageId);
}