import { getConversationBy, createConversation as createChat } from "../models/Conversation.model"
import express from 'express';
import { getUsersBy } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

export const createConversation = async(req: express.Request<{}, {}, { toUserId: string }>, res: express.Response) => {
    const user = await getUsersBy({ id: req.body.toUserId })
    if (!user) throw new ApiError("User to create chat with not found");

    const [alredyCreate] = await getConversationBy({ toUserId: req.body.toUserId })
    if (!alredyCreate) {
        const c = await createChat({ createdByUserId: req.user.id, toUserId: req.body.toUserId })
    }

    res.send({ success: true })
}

export const getConversations = async(req: express.Request, res: express.Response) => {
    const c = await getConversationBy({ implicatedUserId: req.user.id })
    res.send(c)
}