import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { UserModel, USER_ROLE_ENUM } from '../models/user.model';
import { validateParams } from '../middlewares/routeValidation.middleware';
import { PictureModel } from '../models/picture.model';
import { VideoModel } from '../models/video.model';
import { PostModel } from '../models/post.model';

export const postRoutes = express();

postRoutes.post('/create', jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] }), validateParams(checkSchema({
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
})), asyncHandler(async (req, res) => {
  const { body } = req.body;

  //@ts-expect-error
  await PostModel.create({ body, UserId: req.user.id });

  res.send({ success: 'Post Created' });
}));


postRoutes.get('/public/get', asyncHandler(async (req, res) => {
  //@ts-expect-error
  res.send(await PostModel.findAll({ where: { "UserId":req.body.userId }} ));
}));
