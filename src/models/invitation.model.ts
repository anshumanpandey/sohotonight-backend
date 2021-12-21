import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { differenceInSeconds } from 'date-fns';
import VideoChatModel, { videoChatSerializer } from './videoChat.model';
import UserModel, { publicUserSerializer } from './user.model';
import { ApiError } from '../utils/ApiError';
import { WhereAttributeHash } from 'sequelize/types';
import { SendNotificatioToUserId } from '../socketApp/SendNotificationToUser';

export enum INVITATION_RESPONSE_ENUM {
  WAITING_RESPONSE = 'WAITING_RESPONSE',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum INVITATION_TYPE {
  VIDEO_CHAT = 'VIDEO_CHAT',
}

export enum INVITATION_EVENTS {
  NEW_VIDEO_INVITATION = 'NEW_VIDEO_INVITATION',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  INVITATION_CANCELLED = 'INVITATION_CANCELLED',
  INVITATION_HANDSHAKE = 'INVITATION_HANDSHAKE',
}

type InvitationCreationParams = {
  toUserId: string;
  createdByUserId: string;
  senderUuid: string;
  receiverUuid: string;
};

@Table
export default class InvitationModel extends Model {
  @ForeignKey(() => VideoChatModel)
  @Column
  videoChatId: number;

  @BelongsTo(() => VideoChatModel)
  videoChat: VideoChatModel;

  @ForeignKey(() => UserModel)
  @Column
  toUserId: number;

  @BelongsTo(() => UserModel, 'toUserId')
  toUser: UserModel;

  @ForeignKey(() => UserModel)
  @Column
  createdByUserId: number;

  @BelongsTo(() => UserModel, 'createdByUserId')
  createdByUser: UserModel;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false,
  })
  senderUuid: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false,
  })
  receiverUuid: string;

  @Column({
    type: DataType.STRING,
    defaultValue: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE,
  })
  responseFromUser: INVITATION_RESPONSE_ENUM;
}

type InvitationByParams = {
  id?: string;
  toUserId?: string;
  invitationType: INVITATION_TYPE;
  responseFromUser?: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE;
  createdByUserId: string;
  sortByNewest?: boolean;
};
export const getInvitationsBy = async (by: WhereAttributeHash<InvitationByParams>): Promise<InvitationModel[]> => {
  const where: WhereAttributeHash = {};
  if (by.invitationType) {
    where.invitationType = by.invitationType;
  }
  if (by.toUserId) {
    where.toUserId = by.toUserId;
  }
  if (by.id) {
    where.id = by.id;
  }
  if (by?.responseFromUser) {
    where.responseFromUser = by.responseFromUser;
  }
  const chatWhere: WhereAttributeHash = {};
  if (by.createdByUserId) {
    chatWhere.createdByUserId = by.createdByUserId;
  }
  let invitations = await InvitationModel.findAll({
    where,
    include: [
      {
        model: VideoChatModel,
        where: chatWhere,
        required: false,
        include: [{ model: UserModel, required: true, as: 'createdBy', attributes: ['id', 'nickname'] }],
      },
      { model: UserModel, required: true, as: 'toUser', foreignKey: 'toUserId', attributes: ['id', 'nickname'] },
      {
        model: UserModel,
        required: true,
        as: 'createdByUser',
        foreignKey: 'createdByUserId',
        attributes: ['id', 'nickname'],
      },
    ],
  });

  if (by?.sortByNewest && by.sortByNewest === true) {
    return invitations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return invitations;
};

const invitationIsExpired = (i: InvitationModel) => differenceInSeconds(new Date(), i.createdAt) >= 15;

export const updateExpiredInvitations = async ({ invitations }: { invitations: InvitationModel[] }) => {
  const evaluatedInvitations = invitations.map((i) => {
    const is = i.responseFromUser == INVITATION_RESPONSE_ENUM.WAITING_RESPONSE && invitationIsExpired(i);
    if (is) {
      i.responseFromUser = INVITATION_RESPONSE_ENUM.EXPIRED;
    }
    return i;
  });

  const expiredInvitations = evaluatedInvitations
    .filter((i) => i.responseFromUser == INVITATION_RESPONSE_ENUM.EXPIRED)
    .map((i) => ({
      id: i.id,
      responseFromUser: i.responseFromUser,
      senderUuid: i.senderUuid,
      receiverUuid: i.receiverUuid,
    }));
  await InvitationModel.bulkCreate(expiredInvitations, { updateOnDuplicate: ['responseFromUser'] });

  return evaluatedInvitations.filter((i) => i.responseFromUser == INVITATION_RESPONSE_ENUM.WAITING_RESPONSE);
};

export const getVideoInvitationsByUserInvitatedId = async ({ userId }: { userId: string }) => {
  const i = await getInvitationsBy({ toUserId: userId, invitationType: INVITATION_TYPE.VIDEO_CHAT });
  return i;
};

export const getAcceptedInvitations = async ({ userId }: { userId: string }) => {
  return getInvitationsBy({
    createdByUserId: userId,
    invitationType: INVITATION_TYPE.VIDEO_CHAT,
    responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED,
  }).then((i) => i.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
};

type SendVideoInvitationToParams = {
  toUser: UserModel;
  byUser: UserModel;
};
export const createInvitation = async ({ byUser, toUser }: SendVideoInvitationToParams) => {
  const senderUuid = uuidv4();
  const receiverUuid = uuidv4();

  const invitationData: InvitationCreationParams = {
    toUserId: toUser.id,
    createdByUserId: byUser.id,
    senderUuid,
    receiverUuid,
  };

  const [inv] = await getInvitationsBy({
    toUserId: toUser.id,
    responseFromUser: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE,
    sortByNewest: true,
  });
  if (inv && invitationIsExpired(inv) === false) throw new ApiError('Invitation already sended');

  const i = await InvitationModel.create(invitationData);
  const invitation = await getInvitationsBy({ id: i.id });
  return invitation[0];
};

export const updateInvitationByUserAction = async ({
  invitation,
  action,
}: {
  invitation: InvitationModel;
  action: INVITATION_RESPONSE_ENUM;
}) => {
  const invitationNotificationDict: Partial<
    Record<INVITATION_RESPONSE_ENUM, { sendTo: number; eventToSend: INVITATION_EVENTS }>
  > = {
    [INVITATION_RESPONSE_ENUM.REJECTED]: {
      sendTo: invitation.createdByUserId,
      eventToSend: INVITATION_EVENTS.INVITATION_DECLINED,
    },
    [INVITATION_RESPONSE_ENUM.ACCEPTED]: {
      sendTo: invitation.createdByUserId,
      eventToSend: INVITATION_EVENTS.INVITATION_ACCEPTED,
    },
    [INVITATION_RESPONSE_ENUM.CANCELLED]: {
      sendTo: invitation.toUserId,
      eventToSend: INVITATION_EVENTS.INVITATION_CANCELLED,
    },
  };

  await invitation.update({ responseFromUser: action });
  const eventData = invitationNotificationDict[action];
  if (eventData) {
    SendNotificatioToUserId({
      userId: eventData.sendTo,
      eventName: eventData.eventToSend,
      body: invitationSerializer(invitation),
    });
  }
};

export const doHandshake = async ({
  invitation: i,
  handshake,
  user,
}: {
  handshake: any;
  invitation: InvitationModel;
  user: UserModel;
}) => {
  const [invitation] = await getInvitationsBy({ id: i.id });

  let sendTo = invitation.createdByUserId;
  if (invitation.createdByUserId == user.id) {
    sendTo = invitation.toUserId;
  }

  SendNotificatioToUserId({ userId: sendTo, eventName: INVITATION_EVENTS.INVITATION_HANDSHAKE, body: handshake });
};

export const invitationSerializer = (i: InvitationModel) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer(i.createdByUser),
    videoChat: i.videoChat ? videoChatSerializer(i.videoChat) : null,
  };
};

type SendNewCallNotificationToUserParams = {
  toUserId: string;
  invitation: InvitationModel;
  startWithVoice: boolean;
};
export const sendNewCallNotificationToUser = (p: SendNewCallNotificationToUserParams) => {
  const notificationParams = {
    userId: p.toUserId,
    eventName: INVITATION_EVENTS.NEW_VIDEO_INVITATION,
    body: {
      id: p.invitation.id,
      responseFromUser: p.invitation.responseFromUser,
      videoChat: {
        id: p.invitation?.videoChat?.id,
        startWithVoice: p.startWithVoice,
      },
      createdBy: {
        nickname: p.invitation.createdByUser.nickname,
      },
    },
  };
  SendNotificatioToUserId(notificationParams);
};
