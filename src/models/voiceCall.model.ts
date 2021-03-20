import { Table, Column, Model, DataType, BelongsTo, BelongsToMany, ForeignKey, HasMany } from 'sequelize-typescript'
import UserModel from './user.model'
import VideoChatToUser from './videoChatToUser.model';
import { ApiError } from '../utils/ApiError';
import VideoChatInvitation, { INVITATION_RESPONSE_ENUM, INVITATION_TYPE } from './invitation.model';
import { twilioClient, generateVoiceCallToken } from '../utils/TwilioClient';
import Invitation from './invitation.model';

@Table
export default class VoiceCallModel extends Model {

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  twilioCallSid: string;

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

  @ForeignKey(() => UserModel)
  @Column
  createdById: number
  @BelongsTo(() => UserModel)
  createdBy: UserModel

  @ForeignKey(() => VideoChatInvitation)
  @Column
  invitationId: number
  @HasMany(() => VideoChatInvitation)
  invitations: VideoChatInvitation
}


export const createVoiceCall = async ({ fromUser, toUser }: { fromUser: UserModel, toUser: UserModel }) => {
  if (!fromUser.callNumber) throw new ApiError("User has not call number assigned ")
  if (!toUser.callNumber) throw new ApiError("User has not call number assigned ")

  const twilioCall = await twilioClient.calls.create({ from: fromUser.callNumber, to: toUser.callNumber })
  const callToken = await generateVoiceCallToken({ identity: fromUser.id })

  const v = await VoiceCallModel.create({ twilioCallSid: twilioCall.sid, createdById: fromUser.id })
  const i = await Invitation.create({ voiceCallId: v.id, toUserId: toUser.id, invitationType: INVITATION_TYPE.VOICE_CALL })

  v.invitationId = i.id
  await v.save()

  return { token: callToken?.toJwt(), voiceCall: v }
}