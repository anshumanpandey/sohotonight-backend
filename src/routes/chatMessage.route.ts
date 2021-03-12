import express from 'express';
import asyncHandler from "express-async-handler"
import { checkSchema } from 'express-validator';
import { validateParams } from '../middlewares';
import { ChatMessage } from '../models/chatMessage.model';
var jwt = require('express-jwt');
import { UserModel } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { forwardSms } from '../utils/TwilioClient';

export const chatMessage = express();

chatMessage.post('/send', validateParams(checkSchema({
  userEmail: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  body: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
  fromUser: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
})), asyncHandler(async (req, res) => {
  const user = await UserModel.findOne({ where: { emailAddress: req.body.userEmail }})
  if (!user) throw new ApiError("User not found")

  await ChatMessage.create({ toUserId: user.id, body: req.body.body, fromUser: req.body.fromUser })
  if (user.phoneNumber) {
    // we dont await the forwarding of the sms to in case of failing dont send error response
    forwardSms({ toPhone: user.phoneNumber, from: user.callNumber, body: req.body.body })
  }

  res.send({ success: "Message sended" });
}));

