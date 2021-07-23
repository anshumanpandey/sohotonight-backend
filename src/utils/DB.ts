import { Sequelize, SequelizeOptions } from "sequelize-typescript"
import path from "path";
const config = require(__dirname + "/../../config/db");


let SequalizeConfig: SequelizeOptions = {
  models: [ path.join(__dirname, '..', 'models')],
  logging: process.env.DISABLED_SEQUELIZE_LOGS === undefined ? true: false
}

if (process.env.NODE_ENV === "production") {
  console.log('using dialect')
  SequalizeConfig = {
    ...config.production,
    ...SequalizeConfig
  }
} else {
  SequalizeConfig.dialect = 'sqlite',
  SequalizeConfig.storage = path.join(__dirname, '..', '..', 'sohonight.sqlite')
}

let sequelize = new Sequelize(SequalizeConfig);

export default sequelize;