import { Table, Column, Model, DataType, BelongsTo, BelongsToMany, ForeignKey, HasMany } from 'sequelize-typescript'
import UserModel from './user.model'
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, { INVITATION_RESPONSE_ENUM, sendVideoInvitationTo } from './invitation.model';

@Table
export default class VideoChatModel extends Model {

  @Column({
    type: DataType.FLOAT(8, 8),
    allowNull: false,
    defaultValue: 0
  })
  timeDuration: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  startDatetime: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  endDatetime: Date | null;

  @ForeignKey(() => UserModel)
  @Column
  createdById: number
  @BelongsTo(() => UserModel)
  createdBy: UserModel

  /*@BelongsToMany(() => UserModel, () => VideoChatToUser)
  users: UserModel[]*/

  @ForeignKey(() => VideoChatInvitation)
  @Column
  invitationId: number
  @HasMany(() => VideoChatInvitation)
  invitations: VideoChatInvitation
}

export const createVideoRoom = async ({ user, toUser }: { user: UserModel, toUser: UserModel }) => {

  //TODO: handle start date on connection
  const v = await VideoChatModel.create({ createdById: user.id })

  const justCreated = await VideoChatModel.findByPk(v.id, { include: [{ model: UserModel }] })
  if (!justCreated) throw new ApiError("Could not create the room")

  const invitation = await sendVideoInvitationTo({ videoChat: v, toUser: toUser })
  v.invitationId = invitation.id
  await v.save()

  return invitation
}

export const getOngoingVideoChats = async () => {
  const onGoinChats = await VideoChatModel
    .findAll({
      where: { endDatetime: null },
      include: [
        { model: VideoChatInvitation, where: { responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED }, required: true },
        { model: UserModel, required: true }
      ]
    })

  return onGoinChats
}

export const endVideoChat = async ({ videoChat }: { videoChat: VideoChatModel }) => {
  videoChat.endDatetime = new Date()
  await videoChat.save()
}