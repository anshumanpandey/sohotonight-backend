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
  NEW_VOICE_INVITATION = "NEW_VOICE_INVITATION",
  NEW_VIDEO_INVITATION = "NEW_VIDEO_INVITATION",
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

  get createdById() {
    if (this.videoChat){
      return this.videoChat.createdById
    }

    return this.voiceCall.createdById
  }
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
      include: [
        { model: VideoChatModel, where: chatWhere, required: false, include: [{ model: UserModel, required: true }] },
        { model: VoiceCallModel, where: chatWhere, required: false, include: [{ model: UserModel, required: true }] },
      ]
    })

  return invitations.map(i => {
    if (i.videoChat) {
      i.videoChat.invitation = i
    }
    if (i.voiceCall) {
      i.voiceCall.invitation = i
    }
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

export const sendVideoInvitationTo = async ({ toUser, callObj }: { toUser: UserModel, callObj: VideoChatModel | VoiceCallModel }) => {
  const senderUuid = uuidv4();
  const receiverUuid = uuidv4();

  let invitationEvent = INVITATION_EVENTS.NEW_VIDEO_INVITATION

  const invitationData: any = {
    toUserId: toUser.id,
    senderUuid,
    receiverUuid
  }

  if (callObj instanceof VideoChatModel) {
    invitationData.videoChatId = callObj.id
    invitationData.invitationType = INVITATION_TYPE.VIDEO_CHAT
  } else if (callObj instanceof VoiceCallModel) {
    invitationData.voiceCallId = callObj.id  
    invitationData.invitationType = INVITATION_TYPE.VOICE_CALL
    invitationEvent = INVITATION_EVENTS.NEW_VOICE_INVITATION
  } else {
    throw new ApiError('Could not create the invitation')
  }

  const i = await InvitationModel.create(invitationData)

  const invitation = await getInvitationsBy({ id: i.id })

  sendNotificatioToUserId({ userId: toUser.id, eventName: invitationEvent, body: invitationSerializer(invitation[0]) })
  return i
}

export const acceptInvitation = async ({ invitationId }: { invitationId: string }) => {
  const [invitation] = await getInvitationsBy({ id: invitationId })
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.ACCEPTED })
  sendNotificatioToUserId({ userId: invitation.createdById, eventName: INVITATION_EVENTS.INVITATION_ACCEPTED, body: invitationSerializer(invitation) })
}

export const declineInvitation = async ({ invitationId }: { invitationId: string }) => {
  const invitation = await InvitationModel.findByPk(invitationId)
  if (!invitation) throw new ApiError("Invitation not found")

  await invitation.update({ responseFromUser: INVITATION_RESPONSE_ENUM.REJECTED })
}

export const invitationSerializer = (i: InvitationModel) => {
  return {
    ...i.toJSON(),
    userTo: publicUserSerializer((i.videoChat || i.voiceCall).createdBy),
    videoChat: i.videoChat ? videoChatSerializer(i.videoChat) : null,
    voiceCall: i.voiceCall ? i.voiceCall.toJSON() : null
  }
}