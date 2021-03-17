import { Table, Column, Model, DataType, BelongsTo, BelongsToMany, ForeignKey, HasMany } from 'sequelize-typescript'
import UserModel from './user.model'
import VideoChatToUser from './videoChatToUser.model';
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, { INVITATION_RESPONSE_ENUM } from './videochatInvitation.model';
import { twilioClient } from '../utils/TwilioClient';

@Table
export default class VideoChatModel extends Model {

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  twilioRoomSid: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  roomName: string;

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
  roomStartDatetime: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  roomEndDatetime: Date | null;

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

export const createVideoChat = async (p: { twilioRoomSid: string, createdBy: UserModel, roomName: string }) => {
  const v = await VideoChatModel.create({ twilioRoomSid: p.twilioRoomSid, createdById: p.createdBy.id, roomName: p.roomName })

  /*if (p.users && Array.isArray(p.users)) {
    const data = p.users.map(p => ({ userId: p.id, videoChatId: v.id }))
    await VideoChatToUser.bulkCreate(data)
  }*/

  const justCreated = await VideoChatModel.findByPk(v.id, { include: [{ model: UserModel }] })
  if (!justCreated) throw new ApiError("Could not create the room")

  return justCreated
}

export const getOngoingVideoChats = async () => {
  const onGoinChats = await VideoChatModel
    .findAll({
      where: { roomEndDatetime: null },
      include: [
        { model: VideoChatInvitation, where: { responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED }, required: true },
        { model: UserModel, required: true }
      ]
    })

    return onGoinChats
}

export const endVideoChat = async ({ videoChat }: { videoChat: VideoChatModel }) => {
  await twilioClient.video.rooms.get(videoChat.twilioRoomSid).update({status: 'completed'})
  videoChat.roomEndDatetime = new Date()
  await videoChat.save()
}