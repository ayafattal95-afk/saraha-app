import {Router} from 'express';
import * as messageController from './controller/message.controller.js'
import {authGuard} from "../../lib/auth/guard.js";
import * as requestController from './controller/request.controller.js'

const messageRouter = Router();

messageRouter.post('/', messageController.sendMessage);
messageRouter.post('/public', authGuard, messageController.sendMessage);
messageRouter.get('/', authGuard, messageController.getAllMessages);

messageRouter.post('/request', authGuard, requestController.createRequest);
messageRouter.get('/requests', authGuard, requestController.getRequests);
messageRouter.patch('/requests/:requestId', authGuard, requestController.updateRequestStatus);



export default messageRouter;