import * as requestService  from '../service/request.service.js';

export async function createRequest (req, res, next) {
    try{
        const {messageId} = req.body;
        const requesterId = req.user.sub;

        const request = await requestService.createRequest(
            messageId,
            requesterId
        );
        res.status(201).json({
            message: 'Request created successfully',
            data: request
        });
    }catch(err){
        next(err);
    }
}

export async function getRequests (req, res, next) {
    try{
        const receiverId = req.user.sub;
        const requests = await requestService.getRequests(receiverId);

        res.status(200).json({
            message: 'Requests fetched successfully',
            data: requests
        });
    }catch(err){
        next(err);
    }
}

export async function updateRequestStatus (req, res, next) {
    try {
        const {requestId} = req.params;
        const {status} = req.body;
        const userId = req.user.sub;

        const request = await requestService.updateRequestStatus(
            requestId, userId, status
        );

        res.status(200).json({
            message: 'Request updated successfully',
            data: request
        });
    }catch(err){
        next(err);
    }
}