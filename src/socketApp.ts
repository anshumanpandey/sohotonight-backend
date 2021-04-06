import * as http from "http"
import * as socket from "socket.io"
import * as jwtSocket from "socketio-jwt"
import { JWT_SECRET } from "./middlewares/JwtMiddleware"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import InvitationModel, { INVITATION_EVENTS, doHandshake } from "./models/invitation.model"
import { discountForVideoChat, onChatEnd } from "./controllers/videoChat.controller"
import { VIDEO_CHAT_EVENTS, getOngoingVideoChats } from "./models/videoChat.model"
import VideoModel from "./models/video.model"
import { Logger } from "./utils/Logger"
import VoiceCallModel, { VOICE_CALL_EVENTS } from "./models/voiceCall.model"
import { discountForVoiceCall, onVoiceChatEnd } from "./controllers/voiceCall.controller"
import MessageModel, { MESSAGES_EVENT_ENUM } from "./models/Message.model"

type EmitEvents = {
    [INVITATION_EVENTS.INVITATION_ACCEPTED]: InvitationModel
    [INVITATION_EVENTS.INVITATION_DECLINED]: InvitationModel
    [INVITATION_EVENTS.NEW_VIDEO_INVITATION]: InvitationModel
    [VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED]: VideoModel,
    [INVITATION_EVENTS.NEW_VOICE_INVITATION]: VoiceCallModel,
    [VOICE_CALL_EVENTS.VOICE_CALL_ENDED]: VoiceCallModel
    [INVITATION_EVENTS.INVITATION_HANDSHAKE]: any
    [MESSAGES_EVENT_ENUM.NEW_MESSAGE]: MessageModel
}
const connDictionary = new Map<string | number, socket.Socket<EmitEvents, DefaultEventsMap>>()

const storeUserConnection = ({ userId, socketConn }: { userId: number, socketConn: socket.Socket<DefaultEventsMap, DefaultEventsMap> }) => {
    Logger.info(`storing connection for user ${userId}`)
    connDictionary.set(userId, socketConn)
}

export const sendNotificatioToUserId = ({ userId, eventName, body }: { userId: string | number, eventName: keyof EmitEvents, body: unknown }) => {
    const conn = connDictionary.get(userId)
    if (!conn) {
        Logger.info(`connection for user ${userId} not found`)
        return null
    }

    Logger.info(`sending event [${eventName}] to user ${userId}`)
    conn.emit(eventName, body)
}

let io = null
export const startSocketServer = (s: http.Server) => {
    io = new socket.Server(s, {
        cors: {
            origin: ["http://localhost:3000", "https://www.sohotonight.com", "https://sohotonight.com"],
            methods: ["GET", "POST"]
          }
    })
    io.use(jwtSocket.authorize({
        secret: JWT_SECRET,
        handshake: true,
        auth_header_required: true
    }));

    //@ts-expect-error
    io.on('connection', (client: socket.Socket<DefaultEventsMap, DefaultEventsMap> & { decoded_token: { id: number }}) => {
        storeUserConnection({ userId: client.decoded_token.id, socketConn: client })

        client.on('DISCOUNT_VIDEO_CHAT', (d) => discountForVideoChat({ ...d, user: client.decoded_token }));
        client.on('VOICE_CALL_ENDED', (d) => discountForVoiceCall({ ...d, user: client.decoded_token }));
        client.on('END_VIDEO_CHAT', onChatEnd);
        client.on('END_VOICE_CHAT', onVoiceChatEnd);
        client.on('CONNECTION_HANDSHAKE', (e) => doHandshake({ ...e, user: client.decoded_token }) );
        
        client.on('disconnect', () => {
            console.log("disconnected")
            getOngoingVideoChats({ relatedUser: client.decoded_token.id })
            .then(chats => {
                chats.map(c => onChatEnd(c))
            })
        });
    });
}