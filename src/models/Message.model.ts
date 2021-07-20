import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model'
import ConversationModel from './Conversation.model'
import { ApiError } from '../utils/ApiError'

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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  readed: boolean

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

export const createMessage = async ({ conversation, createdByUser, body }: { conversation: ConversationModel, createdByUser: UserModel, body: string }) => {
  const m = await MessageModel.create({ conversationId: conversation.id , createdByUserId: createdByUser.id, body }, { include: [{ model: UserModel }]})

  const message = await getMessageById(m.id)
  if (!message) throw new ApiError("Could not create messages")

  return message
}

const getMessageById = async (id: string) => {
  const m = await MessageModel.findByPk(id,{ include: [{ model: UserModel, required: true }]})
  return m
}