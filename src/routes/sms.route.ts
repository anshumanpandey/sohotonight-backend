import express from 'express';
import asyncHandler from "express-async-handler"
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import UserModel from '../models/user.model';
import { ApiError } from '../utils/ApiError';

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
  if (user.callNumber) {
    twiml.message({ to: user.phoneNumber, from: user.callNumber }, req.body.Body )
  }

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
}))
