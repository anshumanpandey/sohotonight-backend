import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model';

@Table
export default class PaymentModel extends Model {

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  transactionId: number


  @ForeignKey(() => UserModel)
  userId: string
  @BelongsTo(() => UserModel)
  user: UserModel

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}