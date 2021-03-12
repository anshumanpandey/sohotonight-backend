import express from 'express';
import asyncHandler from "express-async-handler"
import { SmsModel, SMS_DIRECTION } from '../models/sms.model';
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { forwardSms, TWILIO_INTERNAL_NUM } from '../utils/TwilioClient';

export const smsRoutes = express();

smsRoutes.post('/track', asyncHandler(async (req, res) => {
  console.log(req.body)

  await SmsModel.create({ body: req.body.Body, toNumber: req.body.To, fromNumber: req.body.From, direction: SMS_DIRECTION.INCOMING })
  const user = await UserModel.findOne({ where: { callNumber: req.body.To }})

  if (!user) throw new ApiError(`User with phone number ${req.body.To} not found`);
  if (!user.phoneNumber) throw new ApiError("User has  not phone number assigned");

  const forward = forwardSms({ to: user.phoneNumber, from: TWILIO_INTERNAL_NUM, body: req.body.Body })

  res.set('Content-Type', 'text/xml');
  res.send(forward.toString());
}));