import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript'
import { Op, Transaction } from "sequelize"
import PictureModel from "./picture.model";
import VideoModel from "./video.model";
import PostModel from "./post.model";
import ServiceModel from "./services.model";
import PaymentModel from "./payment.model";
import UserServiceModel from './userService.model';
import VideoChatToUser from './videoChatToUser.model';
import VideoChatModel from './videoChat.model';
import { WhereAttributeHash } from 'sequelize/types';
import { Logger } from '../utils/Logger';
import AssetBought from './AssetBought.model';

export enum USER_ROLE_ENUM {
  MODEL = "MODEL",
  USER = "USER"
}

export const ALLOWED_ROLE = [
  USER_ROLE_ENUM.MODEL,
  USER_ROLE_ENUM.USER,
]

export interface UserAttributes {
  id: string,
  nickname: string,
  firstName?: string,
  lastName?: string,
  phoneNumber?: string
  callNumber?: string
  town?: string
  gender?: string
  postCode?: string
  tokensBalance: number
  aboutYouSummary?: string
  aboutYouDetail?: string
  orientation?: string
  railStation?: string
  password: string,
  emailAddress: string,
  dayOfBirth: string,
  monthOfBirth: string,
  yearOfBirth: string,
  country: string,
  county: string,

  inches: boolean,
  feet: boolean,

  escortServices: boolean,
  phoneChat: boolean,
  webcamWork: boolean,
  contentProducer: boolean,
  allowSocialMediaMarketing: boolean,  

  recievePromotions: boolean,
  hasAdultContentCertification: boolean,

  isTrans: string

  isLogged: boolean

  profilePic?: string
  bannerImage?: string
  authenticationProfilePic: string
  authenticationProfilePicIsAuthenticated: boolean
}

export const RoleKeys = Object.values(USER_ROLE_ENUM).filter(k => !Number.isInteger(k)) as string[]


@Table
export default class UserModel extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  nickname: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  firstName: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  lastName: string | null

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  emailAddress: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  phoneNumber: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  callNumber: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  railStation: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  town: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  aboutYouSummary: string | null

  @Column({
    type: DataType.STRING(2000),
    allowNull: true,
    defaultValue: null
  })
  aboutYouDetail: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  orientation: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  gender: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  postCode: string | null

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  dayOfBirth: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  monthOfBirth: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  yearOfBirth: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "United Kingdom",
  })
  country: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  tokensBalance: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  county: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  profilePic: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  authenticationProfilePic: string | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  bannerImage: string | null

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: USER_ROLE_ENUM.MODEL
  })
  role: string
  
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  inches: number

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  feet: number
  
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isLogged: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  escortServices: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  allowSocialMediaMarketing: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  phoneChat: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  webcamWork: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  contentProducer: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  recievePromotions: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isTrans: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  hasAdultContentCertification: boolean

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  authenticationProfilePicIsAuthenticated: boolean

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetPasswordToken?: string

  @HasMany(() => PostModel)
  Posts: PostModel

  @HasMany(() => VideoModel)
  Videos: VideoModel

  @HasMany(() => AssetBought)
  assetsBought: AssetBought[]

  @HasMany(() => PictureModel)
  Pictures: PictureModel[]

  @HasMany(() => PaymentModel)
  payments: PaymentModel[]

  @BelongsToMany(() => ServiceModel, () => UserServiceModel)
  services: ServiceModel

  @BelongsToMany(() => VideoChatModel, () => VideoChatToUser)
  videoChats: VideoChatModel[]
}

//@ts-expect-error
export const clearUrlFromAsset = function(user) {
  const filteredVideos = user?.Videos.map((vid: any) => {
    const v = vid.toJSON()
    if (v.isFree == false) {
      const { assetUrl, ...video} = v
      return video
    } 
    return v
  })

  //@ts-expect-error
  const filteredPictures = user?.Pictures?.map(vid => {
    const v = vid.toJSON()
    if (v.isFree == false) {
      const { assetUrl, ...video} = v
      return video
    } 
    return v
  })

  const u = user;

  u.Videos = filteredVideos
  u.Pictures = filteredPictures

  return u
};

export const discountUserToken = ({ user, amount = 1 }: { user: UserModel, amount?: number}, opt?: { t?: Transaction}) => {
  const tokenAmount = user.tokensBalance - amount
  Logger.info(`Tokens ${tokenAmount} deducted for user ${user.id}`)
  return user.update({ tokensBalance: tokenAmount }, { transaction: opt?.t })
}

export const getUsersBy = (by: WhereAttributeHash) => {
  return UserModel.findAll({ where: by })
}

export const publicUserSerializer = (u: UserModel) => {
  const { password, ...userData} = u.toJSON() as any
  return userData
}

type GetModelsParams = { exclude?: string[] }
export const getModels = (opt?: GetModelsParams) => {
  const where: WhereAttributeHash = {
    role: {
      [Op.not]: USER_ROLE_ENUM.USER
    }
  }
  if (opt?.exclude) {
    const idToFilter = opt.exclude.filter(i => i !== null && i !== undefined)
    where.id = { [Op.not]: idToFilter }
  }
  return UserModel.findAll({ where,attributes: { exclude: ["password"] }, include: [{ model: ServiceModel }] })
}

export const getLoggedUserData = async (userId: string) => {
  const u = await UserModel.findByPk(userId,{ attributes: { exclude: ["password"] }, include: [{ model: ServiceModel }, { model: AssetBought }] })
  return u
}