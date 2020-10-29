import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string,
  imageName: string,
  price: number,
  isFree?: boolean,
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes { }

export const PictureModel = sequelize.define<UserInstance>("Picture", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  imageName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT({ length: 10, decimals: 2 }),
    allowNull: true,
    defaultValue: false
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
})