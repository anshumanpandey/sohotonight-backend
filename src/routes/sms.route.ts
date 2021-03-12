import express from 'express';
import asyncHandler from "express-async-handler"
import { checkSchema } from 'express-validator';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { validateParams } from '../middlewares';
import { ChatMessage } from '../models/chatMessage.model';
import { SmsModel, SMS_DIRECTION, SMS_SEND_STATUS } from '../models/sms.model';
var jwt = require('express-jwt');
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { forwardSms } from '../utils/TwilioClient';

export const smsRoutes = express();

smsRoutes.post('/track', asyncHandler(async (req, res) => {
  console.log(req.body)
  /*const data = {
    body: req.body.Body,
    toNumber: "asdasd",
    fromNumber: "asd",
    direction: SMS_DIRECTION.INCOMING,
    status: SMS_SEND_STATUS.SENDED
  }
  const sms = await SmsModel.create(data)*/

  const user = await UserModel.findOne({ where: { callNumber: req.body.To }})

  if (!user) throw new ApiError(`User with phone number ${req.body.To} not found`);
  if (!user.phoneNumber) throw new ApiError("User has  not phone number assigned");

  const twiml = new MessagingResponse();
  twiml.message({ to: user.phoneNumber, from: user.callNumber }, req.body.Body )

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
}))
