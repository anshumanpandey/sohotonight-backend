import { Table, Column, Model, HasMany, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model'
import MessageModel from './Message.model'
import { WhereAttributeHash, OrOperator } from 'sequelize/types'
import { Op } from 'sequelize'

@Table
export default class ConversationModel extends Model {

  @ForeignKey(() => UserModel)
  createdByUserId: string
  @BelongsTo(() => UserModel, { foreignKey: "createdByUserId" })
  createdByUser: UserModel

  @ForeignKey(() => UserModel)
  toUserId: string
  @BelongsTo(() => UserModel, { foreignKey: "toUserId" })
  toUser: UserModel

  @HasMany(() => MessageModel)
  messages: MessageModel[]
}

export const getConversationBy = async ({ implicatedUserId, toUserId, id }: { id?: string, implicatedUserId?: string | number, toUserId?: string | number }) => {
  const by: WhereAttributeHash<any> | OrOperator<any> = {}
  
  if (implicatedUserId !== undefined) {
    by[Op.or as any] = [{ createdByUserId: implicatedUserId }, { toUserId: implicatedUserId }];
  }
  if (toUserId !== undefined) {
    by.toUserId = toUserId
  }
  if (id !== undefined) {
    by.id = id
  }
  const c = await ConversationModel.findAll({ where: by, include: [{ model: UserModel, as: "toUser" }, { model: MessageModel }] })

  return c.map(c => {
    c.messages = c.messages.sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())
    return c
  })
}

export const createConversation = ({ createdByUserId, toUserId }: { createdByUserId: string| number, toUserId: string| number }) => {
  return ConversationModel.create({ createdByUserId, toUserId })
}