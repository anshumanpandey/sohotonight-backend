import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import { PaymentModel } from '../models/payment.model';
import { PictureModel } from '../models/picture.model';
import { VideoModel } from '../models/video.model';

export const assetsRoutes = express();

assetsRoutes.get('/single/:type/:id', asyncHandler(async (req, res) => {
  let file = null
  if (req.params.type == "picture") {
    file = await PictureModel.findOne({ where: { id: req.params.id }, attributes: ['price']})
  }
  if (req.params.type == "video") {
    file = await VideoModel.findOne({ where: { id: req.params.id }, attributes: ['price']})
  }

  res.send(file);
}));

