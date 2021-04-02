import { getConversationBy, createConversation as createChat } from "../models/Conversation.model"
import express from 'express';
import { createMessage } from "../models/Message.model";

export const createMessageController = async(req: express.Request<{}, {}, { conversationId: string, body: string }>, res: express.Response) => {
    const [conversation] = await getConversationBy({ id: req.body.conversationId })
    const c = await createMessage({ conversation ,body: req.body.body, createdByUserId: req.user.id})
    res.send(c)
}