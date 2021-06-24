import { getConversationBy, createConversation as createChat } from "../models/Conversation.model"
import express from 'express';
import { createMessage, MESSAGES_EVENT_ENUM } from "../models/Message.model";
import { sendNotificatioToUserId } from "../socketApp";
import { getUsersBy, USER_ROLE_ENUM } from "../models/user.model";
import { renderHtmlTemaplate, Emailtemplates } from "../utils/renderHtmlTemaplate";
import { sendEmail } from "../utils/Mail";

export const createMessageController = async (req: express.Request<{}, {}, { conversationId: string, body: string }>, res: express.Response) => {
    const [conversation] = await getConversationBy({ id: req.body.conversationId })
    //@ts-expect-error
    const c = await createMessage({ conversation, body: req.body.body, createdByUser: req.user })
    sendNotificatioToUserId({
        userId: req.user.id == conversation.toUserId ? conversation.createdByUserId : conversation.toUserId,
        eventName: MESSAGES_EVENT_ENUM.NEW_MESSAGE,
        body: c.toJSON()
    })
    const [modelToNotificate] = await getUsersBy({
        id: conversation.toUserId,
        isLogged: false,
        role: USER_ROLE_ENUM.MODEL
    })
    if (modelToNotificate) {
        const html = renderHtmlTemaplate({
            templateName: Emailtemplates.NewMessageTemplate,
            values: {
                //@ts-expect-error
                username: req.user.nickname
            }
        })
        sendEmail({ to: modelToNotificate.emailAddress, subject: 'New message on SohoTonight', html })
    }
    res.send(c)
}