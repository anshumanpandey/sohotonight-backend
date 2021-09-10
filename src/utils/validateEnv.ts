import { cleanEnv, str, bool } from 'envalid';

const GlobalEnv = cleanEnv(process.env, {
  DISABLED_SEQUELIZE_LOGS: bool({ default: false }),
  LOG_ENABLED: str({ choices: ['CONSOLE', 'FILE'], default: 'CONSOLE' }),
  AWS_KINESIS_ACCESSKEYID: str(),
  AWS_KINESIS_SECRETACCESSKEY: str(),
  JWT_SECRET: str({ devDefault: '6884-***4/22' }),
  DATABASE_URL: str({ devDefault: '' }),
  DB_DIALECT: str({ choices: ['sqlite', 'postgres'], devDefault: 'sqlite' }),
  DB_HOST: str({ devDefault: '' }),
  DB_NAME: str({ devDefault: '' }),
  DB_PASSWORD: str({ devDefault: '' }),
  DB_USERNAME: str({ devDefault: '' }),
});

export default GlobalEnv;
