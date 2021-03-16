import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript'

@Table
export default class AppConfig extends Model<AppConfig> {

  @Column(DataType.FLOAT(2, 2))
  pricePerToken: number

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}