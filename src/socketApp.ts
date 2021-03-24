import * as http from "http"
import * as socket from "socket.io"
import * as jwtSocket from "socketio-jwt"
import { JWT_SECRET } from "./middlewares/JwtMiddleware"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import InvitationModel, { INVITATION_EVENTS } from "./models/invitation.model"
import { onInvitationAccepted, discountForVideoChat, onChatEnd } from "./controllers/videoChat.controller"
import { VIDEO_CHAT_EVENTS, getOngoingVideoChats } from "./models/videoChat.model"
import VideoModel from "./models/video.model"
import { Logger } from "./utils/Logger"

type EmitEvents = {
    [INVITATION_EVENTS.INVITATION_ACCEPTED]: InvitationModel
    [INVITATION_EVENTS.NEW_INVITATION]: InvitationModel
    [VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED]: VideoModel    
}
const connDictionary = new Map<string | number, socket.Socket<EmitEvents, DefaultEventsMap>>()

const storeUserConnection = ({ userId, socketConn }: { userId: number, socketConn: socket.Socket<DefaultEventsMap, DefaultEventsMap> }) => {
    connDictionary.set(userId, socketConn)
}

export const sendNotificatioToUserId = ({ userId, eventName, body }: { userId: string | number, eventName: keyof EmitEvents, body: unknown }) => {
    const conn = connDictionary.get(userId)
    if (!conn) return null

    Logger.info(`sending event [${eventName}] to user ${userId}`)
    conn.emit(eventName, body)
}

let io = null
export const startSocketServer = (s: http.Server) => {
    io = new socket.Server(s, {
        cors: {
            origin: "http://localhost:3000",
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

        client.on('ACCEPT_INVITATION', onInvitationAccepted);
        client.on('DISCOUNT_VIDEO_CHAT', (d) => discountForVideoChat({ ...d, user: client.decoded_token }));
        client.on('END_VIDEO_CHAT', onChatEnd);
        client.on('disconnect', () => {
            console.log("disconnected")
            getOngoingVideoChats({ relatedUser: client.decoded_token.id })
            .then(chats => {
                chats.map(c => onChatEnd(c))
            })
        });
    });
}