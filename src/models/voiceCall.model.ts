import { Table, Column, Model, DataType, BelongsTo, BelongsToMany, ForeignKey, HasMany, HasOne } from 'sequelize-typescript'
import UserModel from './user.model'
import VideoChatToUser from './videoChatToUser.model';
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, { INVITATION_RESPONSE_ENUM, INVITATION_TYPE, sendVideoInvitationTo, getInvitationsBy } from './invitation.model';
import Invitation from './invitation.model';
import { Logger } from '../utils/Logger';
import { sendNotificatioToUserId } from '../socketApp';
import { WhereAttributeHash, OrOperator } from 'sequelize/types';


export enum VOICE_CALL_EVENTS {
  VOICE_CALL_ENDED = "VOICE_CALL_ENDED"
}

@Table
export default class VoiceCallModel extends Model {

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

  @ForeignKey(() => VideoChatInvitation)
  @Column
  invitationId: number
  @HasOne(() => VideoChatInvitation)
  invitation: VideoChatInvitation
}


export const createVoiceCall = async ({ fromUser, toUser }: { fromUser: UserModel, toUser: UserModel }) => {

  const v = await VoiceCallModel.create({ createdById: fromUser.id })
  const invitation = await sendVideoInvitationTo({ callObj: v, toUser: toUser })

  v.invitationId = invitation.id
  await v.save()

  return invitation
}

export const endVoiceCall = async ({ voiceCall }: { voiceCall: VoiceCallModel }) => {
  Logger.info(`Ending voice call ${voiceCall.id}`)
  const endDatetime = new Date()
  await VoiceCallModel.update({ endDatetime }, { where: { id: voiceCall.id }})
  const [i] = await getInvitationsBy({ id: voiceCall.invitationId })
  sendNotificatioToUserId({ userId: voiceCall.createdById, eventName: VOICE_CALL_EVENTS.VOICE_CALL_ENDED, body: voiceCall })
  sendNotificatioToUserId({ userId: i.toUserId, eventName: VOICE_CALL_EVENTS.VOICE_CALL_ENDED, body: voiceCall })
}

export const getOngoingVoiceCall = async (p?: { relatedUser?: number }) => {
  const where: WhereAttributeHash | OrOperator = { endDatetime: null }
  
  const onGoinChats = await VoiceCallModel
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
  Logger.info(`${result.length} OngoingVoiceCall found!`)
  return result
}