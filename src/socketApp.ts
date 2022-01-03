import * as http from 'http';
import * as socket from 'socket.io';
import * as jwtSocket from 'socketio-jwt';
import { JWT_SECRET } from './middlewares/JwtMiddleware';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import InvitationModel, { INVITATION_EVENTS, doHandshake } from './models/invitation.model';
import * as videoCtr from './controllers/videoChat.controller';
import { VIDEO_CHAT_EVENTS, getOngoingVideoChats } from './models/videoChat.model';
import VideoModel from './models/video.model';
import { Logger } from './utils/Logger';
import MessageModel, { MESSAGES_EVENT_ENUM } from './models/Message.model';
import { AUTH_EVENTS } from './controllers/auth.controller';

type SockerConnection = socket.Socket<DefaultEventsMap, DefaultEventsMap> & { decoded_token: { id: number } };
type EmitEvents = {
  [INVITATION_EVENTS.INVITATION_ACCEPTED]: InvitationModel;
  [INVITATION_EVENTS.INVITATION_DECLINED]: InvitationModel;
  [INVITATION_EVENTS.INVITATION_CANCELLED]: InvitationModel;
  [INVITATION_EVENTS.NEW_VIDEO_INVITATION]: InvitationModel;
  [VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED]: VideoModel;
  [VIDEO_CHAT_EVENTS.RESUMED_VIDEO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.STOPPED_VIDEO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.RESUMED_VIDEO_AUDIO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.STOPPED_VIDEO_AUDIO_BROADCAST]: VideoModel;
  [INVITATION_EVENTS.INVITATION_HANDSHAKE]: any;
  [MESSAGES_EVENT_ENUM.NEW_MESSAGE]: MessageModel;
  [AUTH_EVENTS.LOGOUT]: any;
};
const connDictionary = new Map<string | number, socket.Socket<EmitEvents, DefaultEventsMap>>();

const storeUserConnection = ({
  userId,
  socketConn,
}: {
  userId: number;
  socketConn: socket.Socket<DefaultEventsMap, DefaultEventsMap>;
}) => {
  Logger.info(`storing connection for user ${userId}`);
  connDictionary.set(userId, socketConn);
};

export const sendNotificatioToUserId = ({
  userId,
  eventName,
  body,
}: {
  userId: string | number;
  eventName: keyof EmitEvents;
  body: unknown;
}) => {
  const conn = connDictionary.get(userId);
  if (!conn) {
    Logger.info(`connection for user ${userId} not found`);
    return null;
  }

  Logger.info(`sending event [${eventName}] to user ${userId}`);
  conn.emit(eventName, body);
};

const includeUserData = (conn: SockerConnection) => (cb: any) => {
  return (e: any) => cb({ ...e, user: conn.decoded_token });
};

const errorTracker = (s: SockerConnection) => (cb: any) => {
  return async (e: any) => {
    try {
      await cb(e);
    } catch (nativeError) {
      console.log('socketIo error', nativeError);
    }
  };
};

let io = null;
export const startSocketServer = (s: http.Server) => {
  io = new socket.Server(s, {
    cors: {
      origin: ['http://localhost:3000', 'https://www.sohotonight.com', 'https://sohotonight.com'],
      methods: ['GET', 'POST'],
    },
  });
  io.use(
    jwtSocket.authorize({
      secret: JWT_SECRET,
      handshake: true,
      auth_header_required: true,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  io.on('connection', (client: SockerConnection) => {
    storeUserConnection({ userId: client.decoded_token.id, socketConn: client });
    const authWrapper = includeUserData(client);
    const errorWrapper = errorTracker(client);

    client.on('DISCOUNT_VIDEO_CHAT', errorWrapper(authWrapper(videoCtr.discountForVideoChat)));
    client.on('END_VIDEO_CHAT', errorWrapper(videoCtr.onChatEnd));
    client.on('CONNECTION_HANDSHAKE', errorWrapper(authWrapper(doHandshake)));
    client.on('STOP_VIDEO_BROADCAST', errorWrapper(authWrapper(videoCtr.stopVideoBroadcast)));
    client.on('RESUME_VIDEO_BROADCAST', errorWrapper(authWrapper(videoCtr.resumeVideoBroadcast)));
    client.on('STOP_VIDEO_AUDIO_BROADCAST', errorWrapper(authWrapper(videoCtr.stopVideoAudioBroadcast)));
    client.on('RESUME_VIDEO_AUDIO_BROADCAST', errorWrapper(authWrapper(videoCtr.resumeVideoAudioBroadcast)));

    client.on('disconnect', () => {
      Logger.info(`disconnected user [${client.decoded_token.id}]`);
      getOngoingVideoChats({ relatedUser: client.decoded_token.id }).then((chats) => {
        chats.map((c) => videoCtr.onChatEnd(c));
      });
    });
  });
};
