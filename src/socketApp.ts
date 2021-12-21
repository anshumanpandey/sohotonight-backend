import * as http from 'http';
import * as socket from 'socket.io';
import * as jwtSocket from 'socketio-jwt';
import { JWT_SECRET } from './middlewares/JwtMiddleware';
import * as videoCtr from './controllers/videoChat.controller';
import { getOngoingVideoChats } from './models/videoChat.model';
import { SocketConnection } from './socketApp/SocketEvents';
import IncludeUserData from './socketApp/includeUserData';
import ConectionManager from './socketApp/ConectionManager';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { doHandshake } from './models/invitation.model';

const errorTracker = (s: SocketConnection) => (cb: any) => {
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

  io.on(
    'connection',
    // @ts-expect-error
    (client: socket.Socket<DefaultEventsMap, DefaultEventsMap> & { decoded_token: { id: number } }) => {
      ConectionManager.storeUserConnection({ userId: client.decoded_token.id, socketConn: client });
      const authWrapper = IncludeUserData(client);
      const errorWrapper = errorTracker(client);

      client.on('DISCOUNT_VIDEO_CHAT', errorWrapper(authWrapper(videoCtr.discountForVideoChat)));
      client.on('END_VIDEO_CHAT', errorWrapper(videoCtr.onChatEnd));
      client.on('CONNECTION_HANDSHAKE', errorWrapper(authWrapper(doHandshake)));
      client.on('STOP_VIDEO_BROADCAST', errorWrapper(authWrapper(videoCtr.stopVideoBroadcast)));
      client.on('RESUME_VIDEO_BROADCAST', errorWrapper(authWrapper(videoCtr.resumeVideoBroadcast)));
      client.on('STOP_VIDEO_AUDIO_BROADCAST', errorWrapper(authWrapper(videoCtr.stopVideoAudioBroadcast)));
      client.on('RESUME_VIDEO_AUDIO_BROADCAST', errorWrapper(authWrapper(videoCtr.resumeVideoAudioBroadcast)));

      client.on('disconnect', () => {
        console.log('disconnected');
        getOngoingVideoChats({ relatedUser: client.decoded_token.id }).then((chats) => {
          chats.map((c) => videoCtr.onChatEnd(c));
        });
      });
    },
  );
};

export default startSocketServer;
