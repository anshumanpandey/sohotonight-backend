import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import { PaymentModel } from '../models/payment.model';
import { PictureModel } from '../models/picture.model';
import { VideoModel } from '../models/video.model';
import { ApiError } from '../utils/ApiError';
import { sendEmail } from '../utils/Mail';

export const paymentRoutes = express();

paymentRoutes.post('/create', validateParams(checkSchema({
  firstName: {
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
  lastName: {
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
  addressOne: {
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
  addressTwo: {
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
  city: {
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
  country: {
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
  email: {
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
  transactionId: {
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
  await PaymentModel.create(req.body);

  let asset = null;
  if (req.body.assetType == "picture") {
    asset = await PictureModel.findByPk(req.body.assetId);
  } else {
    asset = await VideoModel.findByPk(req.body.assetId);
  }

  if (!asset) throw new ApiError("Asset not found");

  await sendEmail({
    subject: "Payment successfully created on SohoTonight",
    //@ts-expect-error
    body: `Your access link is : ${asset.videoUrl || asset.imageName}`,
    to: req.body.email
  })

  res.send({ success: 'Payment Created' });
}));

