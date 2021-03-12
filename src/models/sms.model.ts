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
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
  FORWARD = "FORWARD",
}

export enum SMS_SEND_STATUS {
  SENDED = "SENDED",
  FAILED_TO_SEND = "FAILED_TO_SEND",
}

interface SmsAttributes {
  id: string,
  body: string,
  toNumber: string,
  fromNumber: string,
  direction: SMS_DIRECTION,
  status: SMS_SEND_STATUS,
  fail_reason?: string,
  twilio_sid?: string,
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
  status: {
    type: DataTypes.STRING(2000),
    allowNull: false
  },
  fail_reason: {
    type: DataTypes.STRING(2000),
    allowNull: true
  },
  twilio_sid: {
    type: DataTypes.STRING(2000),
    allowNull: true
  },
})