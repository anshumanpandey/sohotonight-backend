import { cleanEnv, str, bool } from 'envalid';

const GlobalEnv = cleanEnv(process.env, {
  DISABLED_SEQUELIZE_LOGS: bool({ default: false }),
  LOG_ENABLED: str({ choices: ['CONSOLE', 'FILE'], default: 'CONSOLE' }),
  AWS_KINESIS_ACCESSKEYID: str(),
  AWS_KINESIS_SECRETACCESSKEY: str(),
  AWS_KEY: str(),
  AWS_SECRET: str(),
  JWT_SECRET: str({ devDefault: '6884-***4/22' }),
  DB_DIALECT: str({ choices: ['sqlite', 'postgres'], devDefault: 'sqlite' }),
  PROD_DB_HOSTNAME: str({ devDefault: '' }),
  DB_NAME: str({ devDefault: '' }),
  DB_PASSWORD: str({ devDefault: '' }),
  DB_USERNAME: str({ devDefault: '' }),
});

export default GlobalEnv;
