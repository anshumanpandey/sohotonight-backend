import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, BelongsTo, ForeignKey } from 'sequelize-typescript'
import UserModel from './user.model';

@Table
export default class ChatMessageModel extends Model {

  @Column(DataType.STRING(2000))
  body: string

  @ForeignKey(() => UserModel)
  fromUserId: string
  @BelongsTo(() => UserModel)
  fromUser: UserModel

  @ForeignKey(() => UserModel)
  toUserId: string
  @BelongsTo(() => UserModel)
  toUser: UserModel

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}