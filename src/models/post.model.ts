import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model';

@Table
export default class PostModel extends Model {

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  body: string

  @ForeignKey(() => UserModel)
  userId: string
  @BelongsTo(() => UserModel)
  user: UserModel

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}