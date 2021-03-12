import sequelize from "../utils/DB";

import { DataTypes, Model, Optional } from "sequelize";

export interface TwilioSmsWebhookBody {
  ToCountry:     string;
  ToState:       string;
  SmsMessageSid: string;
  NumMedia:      string;
  ToCity:        string;
  FromZip:       string;
  SmsSid:        string;
  FromState:     string;
  SmsStatus:     string;
  FromCity:      string;
  Body:          string;
  FromCountry:   string;
  To:            string;
  ToZip:         string;
  NumSegments:   string;
  MessageSid:    string;
  AccountSid:    string;
  From:          string;
  ApiVersion:    string;
}

export enum SMS_DIRECTION {
    INCOMING,
    OUTGOING,
}

interface SmsAttributes {
  id: string,
  body: string,
  toNumber: string,
  fromNumber: string,
  direction: SMS_DIRECTION,
}

interface SmsCreationAttributes extends Optional<SmsAttributes, "id"> { }

interface SmsInstance extends Model<SmsAttributes, SmsCreationAttributes>, SmsAttributes { }

export const SmsModel = sequelize.define<SmsInstance>("Sms", {
  // Model attributes are defined here
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
  },
  body: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  toNumber: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  fromNumber: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  direction: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
})