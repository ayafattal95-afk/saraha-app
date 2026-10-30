import {RequestModel}  from "../../../lib/db/requests.js";

export async function createRequest(data) {
    return RequestModel.create(data);
}

export async function getRequests(receiverId) {
    return RequestModel.find({
        receiverOfReq: receiverId
    });
}

export async function getRequestById(requestId) {
    return RequestModel.findById(requestId)
}

export async function updateRequestStatus(requestId, status) {
    return RequestModel.findByIdAndUpdate(
        requestId,
        { status },
        { new: true}
    )
}

export async function findRequest(messageId, requesterId) {
    return RequestModel.findOne({
        messageId, senderOfReq: requesterId
    });
}