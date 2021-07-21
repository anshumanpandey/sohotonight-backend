import { Table, Column, Model, DataType, BelongsTo, BelongsToMany, ForeignKey, HasMany, HasOne } from 'sequelize-typescript'
import UserModel, { publicUserSerializer } from './user.model'
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, { INVITATION_RESPONSE_ENUM, sendVideoInvitationTo, INVITATION_TYPE, invitationSerializer, getInvitationsBy } from './invitation.model';
import { sendNotificatioToUserId } from '../socketApp';
import { Logger } from '../utils/Logger';
import { WhereAttributeHash, OrOperator } from 'sequelize/types';

export enum VIDEO_CHAT_EVENTS {
  VIDEO_CHAT_ENDED = "VIDEO_CHAT_ENDED",
  STOPPED_VIDEO_BROADCAST = "STOPPED_VIDEO_BROADCAST",
  STOPPED_VIDEO_AUDIO_BROADCAST = "STOPPED_VIDEO_AUDIO_BROADCAST",
  RESUMED_VIDEO_BROADCAST = "RESUMED_VIDEO_BROADCAST",
  RESUMED_VIDEO_AUDIO_BROADCAST = "RESUMED_VIDEO_AUDIO_BROADCAST",
}

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
  @HasOne(() => VideoChatInvitation)
  invitation: VideoChatInvitation
}

export const createVideoRoom = async ({ user, toUser, startWithVoice }: { user: UserModel, toUser: UserModel, startWithVoice: boolean }) => {

  //TODO: handle start date on connection
  const v = await VideoChatModel.create({ createdById: user.id })

  const justCreated = await VideoChatModel.findByPk(v.id, { include: [{ model: UserModel }] })
  if (!justCreated) throw new ApiError("Could not create the room")

  const invitation = await sendVideoInvitationTo({ callObj: v, toUser: toUser, startWithVoice })
  v.invitationId = invitation.id
  await v.save()

  return invitation
}

export const getOngoingVideoChats = async (p?: { relatedUser?: number }) => {
  const where: WhereAttributeHash | OrOperator = { endDatetime: null }
  
  const onGoinChats = await VideoChatModel
    .findAll({
      where: where,
      include: [
        { model: VideoChatInvitation, where: { responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED }, required: true },
        { model: UserModel, required: true }
      ]
    })

  let result = onGoinChats
  if (p && p.relatedUser) {
    result = onGoinChats.filter(c => c.createdById == p.relatedUser || c.invitation.toUserId == p.relatedUser)
  }
  return result
}

export const endVideoChat = async ({ videoChat }: { videoChat: VideoChatModel }) => {
  Logger.info(`Ending video chat ${videoChat.id}`)
  const endDatetime = new Date()
  await VideoChatModel.update({ endDatetime }, { where: { id: videoChat.id }})
  const [i] = await getInvitationsBy({ id: videoChat.invitationId })
  sendNotificatioToUserId({ userId: videoChat.createdById, eventName: VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED, body: videoChat })
  sendNotificatioToUserId({ userId: i.toUserId, eventName: VIDEO_CHAT_EVENTS.VIDEO_CHAT_ENDED, body: videoChat })
}

export const videoChatSerializer = (v: VideoChatModel): any => {
  const { createdBy, ...videoChat } = v.toJSON() as any

  return {
    ...videoChat,
    createdBy: publicUserSerializer(v.createdBy)
  }
}

type SetVideBroadcastParams = { videoChat: any, user: UserModel, broadcast: boolean }

const resolveBroadcastEventFor = (media: "AUDIO" | "VIDEO") => async ({ videoChat, user, broadcast }: SetVideBroadcastParams) => {
  const [i] = await getInvitationsBy({ id: videoChat.invitationId })
  Logger.info(`invitation: ${JSON.stringify(i.toJSON())}`)
  Logger.info(`createdById: ${i.createdById}`)
  
  let sendTo = i.toUserId
  if (i.toUserId == user.id) {
    sendTo = i.createdById
  }

  let eventName = VIDEO_CHAT_EVENTS.STOPPED_VIDEO_BROADCAST
  if (media == "VIDEO") {
    if (broadcast === true) {
      eventName = VIDEO_CHAT_EVENTS.RESUMED_VIDEO_BROADCAST
    }
  } else {
    eventName = VIDEO_CHAT_EVENTS.STOPPED_VIDEO_AUDIO_BROADCAST
    if (broadcast === true) {
      eventName = VIDEO_CHAT_EVENTS.RESUMED_VIDEO_AUDIO_BROADCAST
    }
  }

  return {
    sendTo,
    eventName,
    videoChat,
  }
}

export const setVideoBroadcast = async (p: SetVideBroadcastParams) => {
  const { sendTo, eventName, videoChat } = await resolveBroadcastEventFor("VIDEO")(p)
  sendNotificatioToUserId({ userId: sendTo, eventName, body: videoChat })
}

export const setVideoAudioBroadcast = async (p: SetVideBroadcastParams) => {
  const { sendTo, eventName, videoChat } = await resolveBroadcastEventFor("AUDIO")(p)
  sendNotificatioToUserId({ userId: sendTo, eventName, body: videoChat })
}