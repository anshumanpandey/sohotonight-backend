import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, BelongsToMany } from 'sequelize-typescript'
import UserModel from './user.model';
import UserServiceModel from './userService.model';

@Table
export default class ServiceModel extends Model {

  @Column({
    type: DataType.STRING(),
    allowNull: false
  })
  name: string

  @BelongsToMany(() => UserModel, () => UserServiceModel)
  services: ServiceModel

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}