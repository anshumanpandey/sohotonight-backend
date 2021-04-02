import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model'
import ConversationModel from './Conversation.model'
import { sendNotificatioToUserId } from '../socketApp'

export enum MESSAGES_EVENT_ENUM {
  NEW_MESSAGE = "NEW_MESSAGE"
}

@Table
export default class MessageModel extends Model {

  @Column({
    type: DataType.STRING(2000),
    allowNull: false,
  })
  body: string

  @ForeignKey(() => UserModel)
  createdByUserId: string
  @BelongsTo(() => UserModel)
  createdByUser: UserModel

  @ForeignKey(() => ConversationModel)
  @Column
  conversationId: number
  @BelongsTo(() => ConversationModel)
  conversation: ConversationModel
}

export const createMessage = async ({ conversation, createdByUserId, body }: { conversation: ConversationModel, createdByUserId: string, body: string }) => {
  const m = await MessageModel.create({ conversationId: conversation.id , createdByUserId, body })
  sendNotificatioToUserId({ userId: createdByUserId == conversation.toUserId ? conversation.createdByUserId : conversation.toUserId, eventName: MESSAGES_EVENT_ENUM.NEW_MESSAGE, body: m.toJSON() })
  return m
}