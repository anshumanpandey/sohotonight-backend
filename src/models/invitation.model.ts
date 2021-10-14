import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { differenceInSeconds } from 'date-fns';
import VideoChatModel, { videoChatSerializer } from './videoChat.model';
import UserModel, { publicUserSerializer } from './user.model';
import { ApiError } from '../utils/ApiError';
import { WhereAttributeHash } from 'sequelize/types';
import { sendNotificatioToUserId } from '../socketApp';

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
  senderUuid: string;
  receiverUuid: string;
  videoChatId: string;
  startWithVoice: boolean;
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
  @BelongsTo(() => UserModel)
  toUser: UserModel;

  @Column({ defaultValue: false })
  startWithVoice: boolean;

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

  get createdById() {
    return this.videoChat.createdById;
  }
}

type InvitationByParams = {
  id?: string;
  toUserId?: string;
  invitationType: INVITATION_TYPE;
  responseFromUser?: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE;
  createdById: string;
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
  if (by.createdById) {
    chatWhere.createdById = by.createdById;
  }
  console.log({ where });
  let invitations = await InvitationModel.findAll({
    where,
    include: [
      { model: VideoChatModel, where: chatWhere, required: false, include: [{ model: UserModel, required: true }] },
    ],
  });

  invitations = invitations.map((i) => {
    i.videoChat.invitation = i;
    return i;
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
    createdById: userId,
    invitationType: INVITATION_TYPE.VIDEO_CHAT,
    responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED,
  }).then((i) => i.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
};

type SendVideoInvitationToParams = { toUser: UserModel; callObj: VideoChatModel; startWithVoice: boolean };
export const sendVideoInvitationTo = async ({
  toUser,
  callObj,
  startWithVoice = false,
}: SendVideoInvitationToParams) => {
  const senderUuid = uuidv4();
  const receiverUuid = uuidv4();

  const invitationData: InvitationCreationParams = {
    toUserId: toUser.id,
    senderUuid,
    receiverUuid,
    startWithVoice,
    videoChatId: callObj.id,
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
      sendTo: invitation.createdById,
      eventToSend: INVITATION_EVENTS.INVITATION_DECLINED,
    },
    [INVITATION_RESPONSE_ENUM.ACCEPTED]: {
      sendTo: invitation.createdById,
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
    sendNotificatioToUserId({
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
  throw new ApiError('FAKE ERROR');
  const [invitation] = await getInvitationsBy({ id: i.id });

  let sendTo = invitation.createdById;
  if (invitation.createdById == user.id) {
    sendTo = invitation.toUserId;
  }

  sendNotificatioToUserId({ userId: sendTo, eventName: INVITATION_EVENTS.INVITATION_HANDSHAKE, body: handshake });
};

export const invitationSerializer = (i: InvitationModel) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer(i.videoChat.createdBy),
    videoChat: i.videoChat ? videoChatSerializer(i.videoChat) : null,
  };
};
