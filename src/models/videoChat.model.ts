import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasOne } from 'sequelize-typescript';
import { WhereAttributeHash, OrOperator } from 'sequelize/types';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, {
  INVITATION_RESPONSE_ENUM,
  createInvitation,
  invitationSerializer,
  getInvitationsBy,
  INVITATION_EVENTS,
} from './invitation.model';
import { SendNotificatioToUserId } from '../socketApp/SendNotificationToUser';
import { Logger } from '../utils/Logger';
import UserModel, { publicUserSerializer, USER_ROLE_ENUM } from './user.model';
import { createSignalChannel, deleteSignalingChannel, getArnChannelNameFrom } from '../utils/AwsKinesisClient';
import { createConversation, getConversationBy } from './Conversation.model';
import { createMessage, CreateMessageParams, MESSAGES_EVENT_ENUM } from './Message.model';
import InvitationModel from './invitation.model';
import sequelize from '../utils/DB';

export enum VIDEO_CHAT_EVENTS {
  VIDEO_CHAT_ENDED = 'VIDEO_CHAT_ENDED',
  STOPPED_VIDEO_BROADCAST = 'STOPPED_VIDEO_BROADCAST',
  STOPPED_AUDIO_BROADCAST = 'STOPPED_AUDIO_BROADCAST',
  RESUMED_VIDEO_BROADCAST = 'RESUMED_VIDEO_BROADCAST',
  RESUMED_AUDIO_BROADCAST = 'RESUMED_AUDIO_BROADCAST',
}

@Table
export default class VideoChatModel extends Model {
  @Column({
    type: DataType.FLOAT(8, 8),
    allowNull: false,
    defaultValue: 0,
  })
  timeDuration: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  uuid: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startDatetime: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDatetime: Date | null;

  @ForeignKey(() => UserModel)
  @Column
  createdById: number;

  @BelongsTo(() => UserModel)
  createdBy: UserModel;

  @ForeignKey(() => VideoChatInvitation)
  @Column
  invitationId: number;

  @HasOne(() => VideoChatInvitation)
  invitation: VideoChatInvitation;

  @Column({ defaultValue: false })
  startWithVoice: boolean;
}

export const getVideoRoom = ({ id }: { id?: string }): Promise<VideoChatModel | null> => {
  return VideoChatModel.findByPk(id, { include: [{ model: UserModel }] });
};

type CreateVideoRoomParams = {
  byUser: UserModel;
  invitation: InvitationModel;
  startWithVoice: boolean;
};
export const createVideoRoom = async ({ byUser, startWithVoice, invitation }: CreateVideoRoomParams) => {
  const createParams = {
    createdById: byUser.id,
    startDatetime: new Date(),
    invitationId: invitation.id,
    startWithVoice,
  };
  return sequelize.transaction(async (t) => {
    const v = await VideoChatModel.create(createParams, { transaction: t });

    const videoUuid = uuidv4();
    const signalRoom = await createSignalChannel({ videoUuid });
    if (!signalRoom) throw new ApiError('Could not generate video room data');

    v.uuid = videoUuid;
    v.save({ transaction: t });

    const justCreated = await VideoChatModel.findByPk(v.id, { include: [{ model: UserModel }], transaction: t });
    if (!justCreated) throw new ApiError('Could not create the room');

    return justCreated;
  });
};

export const getOngoingVideoChats = async (p?: { relatedUser?: number | number[] }) => {
  const where: WhereAttributeHash | OrOperator = { endDatetime: null };

  const onGoinChats = await VideoChatModel.findAll({
    where,
    include: [
      { model: VideoChatInvitation, where: { responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED }, required: true },
      { model: UserModel, required: true },
    ],
  });

  let result = onGoinChats;
  if (p && p.relatedUser) {
    let relatedUsers: number[] = [];
    if (p.relatedUser instanceof Array) {
      relatedUsers = p.relatedUser;
    } else {
      relatedUsers = [p.relatedUser];
    }
    result = onGoinChats.filter(
      (c) => relatedUsers.includes(c.createdById) === true || relatedUsers.includes(c.invitation.toUserId) === true,
    );
  }
  return result;
};

export const endVideoChat = async ({ videoChat }: { videoChat: VideoChatModel }) => {
  Logger.info(`Ending video chat ${videoChat.id}`);
  const endDatetime = new Date();
  await VideoChatModel.update({ endDatetime }, { where: { id: videoChat.id } });
  const [i] = await getInvitationsBy({ id: videoChat.invitationId });
  const arnChannelName = await getArnChannelNameFrom(videoChat.uuid);
  await deleteSignalingChannel({ arnChannel: arnChannelName });
  SendNotificatioToUserId({
    userId: videoChat.createdById,
    eventName: VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED,
    body: videoChat,
  });
  SendNotificatioToUserId({ userId: i.toUserId, eventName: VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED, body: videoChat });
};

export const videoChatSerializer = (v: VideoChatModel): any => {
  const { createdBy, ...videoChat } = v.toJSON() as any;

  return {
    ...videoChat,
    createdBy: publicUserSerializer(v.createdBy),
  };
};

type SetVideBroadcastParams = { videoChat: any; user: UserModel; broadcast: boolean };

const resolveBroadcastEventFor =
  (media: 'AUDIO' | 'VIDEO') =>
  async ({ videoChat, user, broadcast }: SetVideBroadcastParams) => {
    const [i] = await getInvitationsBy({ id: videoChat.invitationId });

    let sendTo = i.toUserId;
    if (i.toUserId == user.id) {
      sendTo = i.createdByUserId;
    }

    let eventName = VIDEO_CHAT_EVENTS.STOPPED_VIDEO_BROADCAST;
    if (media == 'VIDEO') {
      if (broadcast === true) {
        eventName = VIDEO_CHAT_EVENTS.RESUMED_VIDEO_BROADCAST;
      }
    } else {
      eventName = VIDEO_CHAT_EVENTS.STOPPED_AUDIO_BROADCAST;
      if (broadcast === true) {
        eventName = VIDEO_CHAT_EVENTS.RESUMED_AUDIO_BROADCAST;
      }
    }

    return {
      sendTo,
      eventName,
      videoChat,
    };
  };

export const setVideoBroadcast = async (p: SetVideBroadcastParams) => {
  const { sendTo, eventName, videoChat } = await resolveBroadcastEventFor('VIDEO')(p);
  SendNotificatioToUserId({ userId: sendTo, eventName, body: videoChat });
};

export const setVideoAudioBroadcast = async (p: SetVideBroadcastParams) => {
  const { sendTo, eventName, videoChat } = await resolveBroadcastEventFor('AUDIO')(p);
  SendNotificatioToUserId({ userId: sendTo, eventName, body: videoChat });
};

export const userCanStartCall = (u: UserModel) => {
  if (u.tokensBalance <= 0) throw new ApiError('User has no tokens to start a video chat');
};

export const userCanReceiveACall = async (fromUser: UserModel, toUser: UserModel) => {
  if (fromUser.id === toUser.id) throw new ApiError('Cannot create call to itself');

  const onGoingCalls = await getOngoingVideoChats({ relatedUser: [fromUser.id, toUser.id] });
  if (onGoingCalls.length !== 0) {
    throw new ApiError('User is currently on a call', 409);
  }

  if (toUser.isLogged === false) {
    if (toUser.role === USER_ROLE_ENUM.MODEL) {
      let [conversation] = await getConversationBy({ implicatedUserId: toUser.id });

      if (!conversation) {
        conversation = await createConversation({
          createdByUserId: fromUser.id,
          toUserId: toUser.id,
        });
      }
      const newMessageParams: CreateMessageParams = {
        conversation,
        body: `Missed call from ${fromUser.nickname}`,
        createdByUser: fromUser,
      };
      createMessage(newMessageParams).then((c) => {
        SendNotificatioToUserId({
          userId: toUser.id,
          eventName: MESSAGES_EVENT_ENUM.NEW_MESSAGE,
          body: c.toJSON(),
        });
      });
    }
    throw new ApiError('User is not online', 409);
  }
};

type StartChatRoom = {
  byUser: UserModel;
  invitation: InvitationModel;
  startWithVoice: boolean;
};
export const startChatRoom = async (params: StartChatRoom) => {
  const p = {
    byUser: params.byUser,
    startWithVoice: params.startWithVoice,
    invitation: params.invitation,
  };
  return createVideoRoom(p);
};
