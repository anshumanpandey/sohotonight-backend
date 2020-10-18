import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string,
  name: string,
  email: string,
  address: string,
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
  name: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
})