import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string,
  firstName: string,
  lastName: string,
  addressOne: string,
  addressTwo: string,
  city: string,
  country: string,
  email: string,
  transactionId: string,
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes { }

export const PaymentModel = sequelize.define<UserInstance>("Payment", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  addressOne: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  addressTwo: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
})