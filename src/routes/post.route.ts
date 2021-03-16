import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import PostModel from '../models/post.model';

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

  await PostModel.create({ body, UserId: req.user.id });

  res.send({ success: 'Post Created' });
}));


postRoutes.get('/public/get', asyncHandler(async (req, res) => {
  res.send(await PostModel.findAll({ where: { "UserId":req.body.userId }} ));
}));
