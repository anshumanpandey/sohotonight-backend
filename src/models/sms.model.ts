
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


import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript'

@Table
export default class SmsModel extends Model {

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  body: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  toNumber: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  fromNumber: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  direction: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: false
  })
  status: string;

  @Column({
    type: DataType.STRING(2000),
    allowNull: true
  })
  fail_reason: string | null;

  @Column({
    type: DataType.STRING(2000),
    allowNull: true
  })
  twilio_sid: string | null;
}