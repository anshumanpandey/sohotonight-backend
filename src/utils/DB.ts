import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import path from 'path';
import GlobalEnv from './validateEnv';

const config = require(__dirname + '/../../config/db');

let SequalizeConfig: SequelizeOptions = {
  models: [path.join(__dirname, '..', 'models')],
  logging: !GlobalEnv.DISABLED_SEQUELIZE_LOGS,
};

if (GlobalEnv.isProduction) {
  SequalizeConfig = {
    ...config.production,
    ...SequalizeConfig,
  };
} else {
  SequalizeConfig.dialect = GlobalEnv.DB_DIALECT as 'sqlite';
  SequalizeConfig.storage = path.join(__dirname, '..', '..', 'sohonight.sqlite');
}

const sequelize = new Sequelize(SequalizeConfig);

export default sequelize;
