import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model';

@Table
export default class LogModel extends Model {

  @Column({
    type: DataType.STRING(5000),
    allowNull: false
  })
  body: string

  @ForeignKey(() => UserModel)
  userId?: string
  @BelongsTo(() => UserModel)
  user: UserModel

  @CreatedAt
  createdAt: Date;
}

type CreateLog = { body: string, userId?: string }
export const createLogRecord = (parmas: CreateLog) => {
  return LogModel.create({ body: parmas.body, userId: parmas.userId })
}