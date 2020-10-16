import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string,
  imageName: string,
  price: number,
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
    type: DataTypes.NUMBER,
    allowNull: false
  },
})