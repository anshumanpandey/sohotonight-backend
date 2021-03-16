import { Table, Column, Model, ForeignKey } from 'sequelize-typescript'
import UserModel from './user.model'
import ServiceModel from './services.model'

@Table
export default class UserServiceModel extends Model {
    @ForeignKey(() => UserModel)
    @Column
    userId: number
  
    @ForeignKey(() => ServiceModel)
    @Column
    serivce: number
}