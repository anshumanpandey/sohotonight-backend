import { Table, Column, Model, ForeignKey } from 'sequelize-typescript'
import UserModel from './user.model'
import VideoChatModel from './videoChat.model'
import { Optional } from 'sequelize/types'
  
@Table
export default class VideoChatToUser extends Model {
    @ForeignKey(() => UserModel)
    @Column
    userId: number
  
    @ForeignKey(() => VideoChatModel)
    @Column
    videoChatId: number
}