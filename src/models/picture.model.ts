import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript'
import UserModel from './user.model'
import { AwsFile } from '../utils/AwsS3Client'

@Table
export default class PictureModel extends Model implements AwsFile {

  @Column({
    type: DataType.FLOAT({ length: 10, decimals: 2 }),
    allowNull: true,
    defaultValue: null
  })
  price: number | null

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  awsKey: string

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isFree: boolean

  @ForeignKey(() => UserModel)
  userId: string
  @BelongsTo(() => UserModel)
  user: UserModel

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}