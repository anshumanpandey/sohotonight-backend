import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import PictureModel from '../models/picture.model';
import VideoModel from '../models/video.model';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { validateParams } from '../middlewares';
import { checkSchema } from 'express-validator';
import { buyAssetController, generateAssetUrlController } from '../controllers/asset.controller';

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

assetsRoutes.post('/generateUrl', JwtMiddleware(), validateParams(checkSchema({
  assetId: {
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
  assetType: {
    in: ['body'],
    isIn: {
      errorMessage: `must be one of VIDEO, PICTURE`,
      options: [["VIDEO", "PICTURE"]],
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
})), asyncHandler(generateAssetUrlController));

assetsRoutes.post('/buy', JwtMiddleware(), validateParams(checkSchema({
  assetId: {
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
  userId: {
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
  assetType: {
    in: ['body'],
    isIn: {
      errorMessage: `must be one of VIDEO, PICTURE`,
      options: [["VIDEO", "PICTURE"]],
    },
    isEmpty: {
      errorMessage: 'Missing field',
      negated: true
    },
    trim: true
  },
})), asyncHandler(buyAssetController));
