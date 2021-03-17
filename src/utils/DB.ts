import { Sequelize, SequelizeOptions } from "sequelize-typescript"
import path from "path";

let SequalizeConfig: SequelizeOptions = {
  models: [ path.join(__dirname, '..', 'models')],
}

if (process.env.DB_DIALECT) {
  console.log('using dialect')
  SequalizeConfig.database = process.env.DB_NAME,
  SequalizeConfig.username = process.env.DB_USERNAME,
  SequalizeConfig.password = process.env.DB_PASSWORD,
  SequalizeConfig.host = process.env.DB_HOST,
  SequalizeConfig.dialect = process.env.DB_DIALECT as "postgres" || 'postgres'
} else {
  SequalizeConfig.dialect = 'sqlite',
  SequalizeConfig.storage = path.join(__dirname, '..', '..', 'sohonight.sqlite')
}

let sequelize = new Sequelize(SequalizeConfig);

export default sequelize;