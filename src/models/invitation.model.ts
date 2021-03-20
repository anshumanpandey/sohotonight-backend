import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid';
import VideoChatModel from './videoChat.model';
import UserModel, { publicUserSerializer } from './user.model';
import { ApiError } from '../utils/ApiError';
import VoiceCallModel from './voiceCall.model';
import { WhereAttributeHash } from 'sequelize/types';

export enum INVITATION_RESPONSE_ENUM {
  WAITING_RESPONSE = "WAITING_RESPONSE",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

export enum INVITATION_TYPE {
  VIDEO_CHAT = "VIDEO_CHAT",
  VOICE_CALL = "VOICE_CALL",
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

const getInvitationsBy = (by: WhereAttributeHash<{ toUserId?: string, invitationType: INVITATION_TYPE, responseFromUser?: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE,createdById: string }>) => {
  const where: WhereAttributeHash = { invitationType: by.invitationType }
  if (by.toUserId) {
    where.toUserId = by.toUserId
  }
  const chatWhere: WhereAttributeHash = {}
  if (by.createdById) {
    chatWhere.createdById = by.createdById
  }
  return InvitationModel
    .findAll({
      where,
      include: [{ model: VideoChatModel, where: chatWhere, required: true, include: [{ model: UserModel, required: true }] }]
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

export const sendVideoInvitationTo = ({ toUser, videoChat }: { toUser: UserModel, videoChat: VideoChatModel }) => {
  const senderUuid = uuidv4();
  const receiverUuid = uuidv4();

  return InvitationModel.create({
    toUserId: toUser.id,
    videoChatId: videoChat.id,
    invitationType: INVITATION_TYPE.VIDEO_CHAT,
    senderUuid,
    receiverUuid
  })
}

export const acceptInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await InvitationModel.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED })
}

export const declineInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await InvitationModel.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.REJECTED })
}

export const invitationSerializer = (i: InvitationModel) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer(i.videoChat.createdBy)
  }
}