import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

interface ServiceAttributes {
  id: string,
  name: string,
}

interface serviceCreationAttributes extends Optional<ServiceAttributes, "id"> { }

interface ServiceInstance extends Model<ServiceAttributes, serviceCreationAttributes>, ServiceAttributes { }

export const ServiceModel = sequelize.define<ServiceInstance>("Service", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(),
    allowNull: false
  },
})