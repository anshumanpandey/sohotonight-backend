import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";


interface AppConfigAttributes {
  id: string,
  pricePerToken: number,
}

interface AppConfigCreationAttributes extends Optional<AppConfigAttributes, "id"> { }

interface AppConfigInstance extends Model<AppConfigAttributes, AppConfigCreationAttributes>, AppConfigAttributes { }

export const AppConfig = sequelize.define<AppConfigInstance>("AppConfig", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  pricePerToken: {
    type: DataTypes.FLOAT(2, 2),
    defaultValue: 1
  },
})