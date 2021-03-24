import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid';
import VideoChatModel, { videoChatSerializer } from './videoChat.model';
import UserModel, { publicUserSerializer } from './user.model';
import { ApiError } from '../utils/ApiError';
import VoiceCallModel from './voiceCall.model';
import { WhereAttributeHash } from 'sequelize/types';
import { sendNotificatioToUserId } from '../socketApp';

export enum INVITATION_RESPONSE_ENUM {
  WAITING_RESPONSE = "WAITING_RESPONSE",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

export enum INVITATION_TYPE {
  VIDEO_CHAT = "VIDEO_CHAT",
  VOICE_CALL = "VOICE_CALL",
}


export enum INVITATION_EVENTS {
  NEW_INVITATION = "NEW_INVITATION",
  INVITATION_ACCEPTED = "INVITATION_ACCEPTED",
}

@Table
export default class InvitationModel extends Model {

  @ForeignKey(() => VideoChatModel)
  @Column
  videoChatId: number
  @BelongsTo(() => VideoChatModel)
  videoChat: VideoChatModel

  @ForeignKey(() => VoiceCallModel)
  @Column
  voiceCallId: number
  @BelongsTo(() => VoiceCallModel)
  voiceCall: VoiceCallModel

  @ForeignKey(() => UserModel)
  @Column
  toUserId: number
  @BelongsTo(() => UserModel)
  toUser: UserModel

  @Column({ allowNull: false })
  invitationType: INVITATION_TYPE

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  senderUuid: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  receiverUuid: string;
  
  @Column({
    type: DataType.STRING,
    defaultValue: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE
  })
  responseFromUser: string
}

type InvitationByParams = { id?: string,toUserId?: string, invitationType: INVITATION_TYPE, responseFromUser?: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE, createdById: string }
export const getInvitationsBy = async (by: WhereAttributeHash<InvitationByParams>) => {
  const where: WhereAttributeHash = {}
  if (by.invitationType) {
    where.invitationType = by.invitationType
  }
  if (by.toUserId) {
    where.toUserId = by.toUserId
  }
  if (by.id) {
    where.id = by.id
  }
  const chatWhere: WhereAttributeHash = {}
  if (by.createdById) {
    chatWhere.createdById = by.createdById
  }
  const invitations = await InvitationModel
    .findAll({
      where,
      include: [{ model: VideoChatModel, where: chatWhere, required: true, include: [{ model: UserModel, required: true }] }]
    })

  return invitations.map(i => {
    i.videoChat.invitation = i
    return i
  })
}

export const getVideoInvitationsByUserInvitatedId = async ({ userId }: { userId: string }) => {
  return getInvitationsBy({ toUserId: userId, invitationType: INVITATION_TYPE.VIDEO_CHAT})
}

export const getAcceptedInvitations = async ({ userId }: { userId: string }) => {
  return getInvitationsBy({ createdById: userId, invitationType: INVITATION_TYPE.VIDEO_CHAT, responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED })
  .then(i => i.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()))
}

export const getVoiceInvitationsByUserInvitatedId = async ({ userId }: { userId: string }) => {
  return getInvitationsBy({ toUserId: userId, invitationType: INVITATION_TYPE.VOICE_CALL})
}

export const sendVideoInvitationTo = async ({ toUser, videoChat }: { toUser: UserModel, videoChat: VideoChatModel }) => {
  const senderUuid = uuidv4();
  const receiverUuid = uuidv4();


  const i = await InvitationModel.create({
    toUserId: toUser.id,
    videoChatId: videoChat.id,
    invitationType: INVITATION_TYPE.VIDEO_CHAT,
    senderUuid,
    receiverUuid
  })

  const invitation = await getInvitationsBy({ id: i.id })

  sendNotificatioToUserId({ userId: toUser.id, eventName: INVITATION_EVENTS.NEW_INVITATION, body: invitationSerializer(invitation[0]) })
  return i
}

export const acceptInvitation = async ({ invitationId }: { invitationId: string }) => {
  const [invitation] = await getInvitationsBy({ id: invitationId })
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED })
  sendNotificatioToUserId({ userId: invitation.videoChat.createdById, eventName: INVITATION_EVENTS.INVITATION_ACCEPTED, body: invitationSerializer(invitation) })
}

export const declineInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await InvitationModel.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.REJECTED })
}

export const invitationSerializer = (i: InvitationModel) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer(i.videoChat.createdBy),
    videoChat: videoChatSerializer(i.videoChat)
  }
}