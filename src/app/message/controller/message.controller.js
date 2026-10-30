import * as messageService from '../service/message.service.js';
import {validateBody} from "../../../lib/validation/validation.js";
import {sendMessageDto} from "../dto/message.dto.js";


export async function sendMessage(req, res, next) {
    try {
        // validate data
        const data = validateBody(sendMessageDto, req.body);
        const {content, receiver} = data;
        const sender = req.user?.sub;
        const createdMessage = await messageService.sendMessage(content, receiver, sender);
        res.status(201).json({
            message: 'message created successfully.',
            success: true,
            data: createdMessage
        })
    }catch (error) {
        next(error);
    }
}

export async function getAllMessages(req, res, next) {
    try {
      const messages = await messageService.getAllMessages(req.user.sub);
      res.json({
          message: 'ok',
          success: true,
          data: messages
      });
    }catch (error) {
        next(error);
    }
}
