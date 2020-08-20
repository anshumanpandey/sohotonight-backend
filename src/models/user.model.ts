import sequelize from "../utils/DB";

import { DataTypes, Model,Optional } from "sequelize";

export enum USER_ROLE_ENUM {
  ADMIN = "Admin",
  ESCORT = "Escort",
  CAM = "Cam",
  MASSAGE = "Massage"
}

interface UserAttributes {
  id: string,
  name: string,
  email: string,
  mobileNumber: string,
  age: string,
  role: USER_ROLE_ENUM,
  password: string,
  location: string,
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes{}

export const RoleKeys = Object.values(USER_ROLE_ENUM).filter(k => !Number.isInteger(k)) as string[]

export const UserModel = sequelize.define<UserInstance>("User", {
    // Model attributes are defined here
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...RoleKeys)
    }
})