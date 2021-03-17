import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model'

@Table
export default class VideoModel extends Model {

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  videoUrl: number

  @Column({
    type: DataType.FLOAT({ length: 10, decimals: 2 }),
    allowNull: true,
    defaultValue: null
  })
  price: number | null

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isFree: number

  @ForeignKey(() => UserModel)
  userId: string
  @BelongsTo(() => UserModel)
  user: UserModel

}