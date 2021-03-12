import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { UserModel, USER_ROLE_ENUM } from '../models/user.model';
import { validateParams } from '../middlewares/routeValidation.middleware';
import { PictureModel } from '../models/picture.model';
import { VideoModel } from '../models/video.model';
import { PostModel } from '../models/post.model';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { SmsModel, SMS_DIRECTION } from '../models/sms.model';

export const postRoutes = express();

postRoutes.post('/track', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), asyncHandler(async (req, res) => {
  console.log(req.body)
  const sms = await SmsModel.create({ body: req.body.Body, toNumber: "asdasd", fromNumber: "asd", direction: SMS_DIRECTION.INCOMING })
  res.send({ success: "Tracked" });
}));