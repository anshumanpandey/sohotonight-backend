import * as socket from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AUTH_EVENTS } from '../controllers/auth.controller';
import InvitationModel, { INVITATION_EVENTS } from '../models/invitation.model';
import MessageModel, { MESSAGES_EVENT_ENUM } from '../models/Message.model';
import VideoModel from '../models/video.model';
import { VIDEO_CHAT_EVENTS } from '../models/videoChat.model';

export type SocketConnection = socket.Socket<DefaultEventsMap, DefaultEventsMap> & { decoded_token: { id: number } };

export type SocketEmitEvents = {
  [INVITATION_EVENTS.INVITATION_ACCEPTED]: InvitationModel;
  [INVITATION_EVENTS.INVITATION_DECLINED]: InvitationModel;
  [INVITATION_EVENTS.INVITATION_CANCELLED]: InvitationModel;
  [INVITATION_EVENTS.NEW_VIDEO_INVITATION]: InvitationModel;
  [VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED]: VideoModel;
  [VIDEO_CHAT_EVENTS.RESUMED_VIDEO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.STOPPED_VIDEO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.RESUMED_AUDIO_BROADCAST]: VideoModel;
  [VIDEO_CHAT_EVENTS.STOPPED_AUDIO_BROADCAST]: VideoModel;
  [INVITATION_EVENTS.INVITATION_HANDSHAKE]: any;
  [MESSAGES_EVENT_ENUM.NEW_MESSAGE]: MessageModel;
  [AUTH_EVENTS.LOGOUT]: any;
};

export type AwsSignalingClientEvents = 'open' | 'sdpOffer' | 'iceCandidate' | 'close' | 'error';
