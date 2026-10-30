import { model, Schema } from 'mongoose';

const schema = new Schema({
    messageId: { type: Schema.Types.ObjectId, ref: "Message" },
    senderOfReq: { type: Schema.Types.ObjectId, ref: "User" },
    receiverOfReq: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["pending", "accept", "decline"],
        default: "pending"
    }
}, {
    timestamps: true
});

export const RequestModel = model('RequestModel', schema);

