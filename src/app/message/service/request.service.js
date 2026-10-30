import * as requestRepository  from '../repository/request.repository.js';
import * as messageRepository from '../repository/message.repository.js';
import {AppError} from "../../../lib/error/error.js";

export async function createRequest(messageId,requesterId) {
    const message = await messageRepository.getMessageById(messageId);

    if (!message) throw new AppError('Message not found', 404);
    if (!message.sender) throw new AppError('Cannot request identity for an anonymous message', 400);
    if (message.sender.toString() === requesterId.toString()) {
        throw new AppError('You cannot request your own identity', 400);
    }

    const existingRequest = await requestRepository.findRequest(
        messageId, requesterId
    );
    if (existingRequest) throw new AppError('Request already exists', 409);

    const request = await requestRepository.createRequest({
        messageId,
        senderOfReq: requesterId,
        receiverOfReq: message.sender,
    });
    return request;
}

export async function getRequests(receiverId) {
    return requestRepository.getRequests(receiverId);
}

export async function updateRequestStatus(requestId, userId, status) {
    const request = await requestRepository.getRequestById(requestId);

    if (!request) throw new AppError('Request not found', 404);
    if (request.receiverOfReq.toString() !== userId.toString()) {
        throw new AppError('You are not allowed to update this request', 403);
    }
    if (request.status !== 'pending')   throw new AppError('Request has already been processed', 400);
    if (!['accept', 'decline'].includes(status)) {
        throw new AppError('Invalid request status', 400);
    }

    return requestRepository.updateRequestStatus(requestId, status);
}