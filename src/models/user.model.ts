import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";
import { PictureModel } from "./picture.model";
import { VideoModel } from "./video.model";
import { PostModel } from "./post.model";
import { ServiceModel } from "./services.model";
import { PaymentModel } from "./payment.model";

export enum USER_ROLE_ENUM {
  SUPER_ADMIN = "Super_admin",
  ESCORT = "Escort",
  CAM = "Cam",
  MASSAGE = "Massage",
  CLIENT = "Client"
}

export const ALLOWED_ROLE = [
  USER_ROLE_ENUM.CAM,
  USER_ROLE_ENUM.CLIENT,
]

interface UserAttributes {
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

interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes { }

export const RoleKeys = Object.values(USER_ROLE_ENUM).filter(k => !Number.isInteger(k)) as string[]

export const UserModel = sequelize.define<UserInstance>("User", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  callNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  railStation: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  town: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  aboutYouSummary: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  aboutYouDetail: {
    type: DataTypes.STRING(2000),
    allowNull: true,
    defaultValue: null
  },
  orientation: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  postCode: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  dayOfBirth: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monthOfBirth: {
    type: DataTypes.STRING,
    allowNull: false
  },
  yearOfBirth: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: "United Kingdom",
  },
  tokensBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  inches: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  feet: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  county: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isLogged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  escortServices: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allowSocialMediaMarketing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  phoneChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  webcamWork: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  contentProducer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recievePromotions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  profilePic: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  authenticationProfilePic: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isTrans: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hasAdultContentCertification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  authenticationProfilePicIsAuthenticated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
})

//@ts-expect-error
export const clearUrlFromAsset = function(user) {
  const filteredVideos = user?.Videos.map((vid: any) => {
    const v = vid.toJSON()
    if (v.isFree == false) {
      const { videoUrl, ...video} = v
      return video
    } 
    return v
  })

  //@ts-expect-error
  const filteredPictures = user?.Pictures.map(vid => {
    const v = vid.toJSON()
    if (v.isFree == false) {
      const { imageName, ...video} = v
      return video
    } 
    return v
  })

  const u = user?.toJSON();

  u.Videos = filteredVideos
  u.Pictures = filteredPictures

  return u
};

UserModel.hasMany(PictureModel);
PictureModel.belongsTo(UserModel);

UserModel.hasMany(VideoModel);
VideoModel.belongsTo(UserModel);

UserModel.hasMany(PostModel);
PostModel.belongsTo(UserModel);

UserModel.hasMany(PaymentModel);
PaymentModel.belongsTo(UserModel);

UserModel.belongsToMany(ServiceModel, { through: "User_Services" });
ServiceModel.belongsToMany(UserModel, { through: "User_Services" });