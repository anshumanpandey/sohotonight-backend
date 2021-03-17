import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript'
import VideoChatModel from './videoChat.model';
import UserModel, { publicUserSerializer } from './user.model';
import { ApiError } from '../utils/ApiError';

export enum INVITATION_RESPONSE_ENUM {
  WAITING_RESPONSE = "WAITING_RESPONSE",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
}

@Table
export default class VideoChatInvitation extends Model {

  @ForeignKey(() => VideoChatModel)
  @Column
  videoChatId: number
  @BelongsTo(() => VideoChatModel)
  videoChat: VideoChatModel

  @ForeignKey(() => UserModel)
  @Column
  toUserId: number
  @BelongsTo(() => UserModel)
  toUser: UserModel
  
  @Column({
    type: DataType.STRING,
    defaultValue: INVITATION_RESPONSE_ENUM.WAITING_RESPONSE
  })
  responseFromUser: string
}

export const getInvitationsByUserInvitatedId = ({ userId }: { userId: string }) => {
  return VideoChatInvitation
    .findAll({
      where: { toUserId: userId }, include: [{ model: VideoChatModel, required: true, include: [{ model: UserModel, required: true }] }]
    })
}

export const sendInvitationTo = ({ toUser, videoChat }: { toUser: UserModel, videoChat: VideoChatModel }) => {
  return VideoChatInvitation.create({ toUserId: toUser.id, videoChatId: videoChat.id })
}

export const acceptInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await VideoChatInvitation.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED })
}

export const declineInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await VideoChatInvitation.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.REJECTED })
}

export const videoChatInvitationSerializer = (i: VideoChatInvitation) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer(i.videoChat.createdBy)
  }
}