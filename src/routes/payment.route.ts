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

  //@ts-expect-error
  const donwloadLink = asset.videoUrl || asset.imageName

  await sendEmail({
    subject: "Payment successfully created on SohoTonight",
    body: `Thanks you for your purchase on soho tonight.

You can access your purchased picture/video by clicking the link below -
${donwloadLink}

Regards
Soho Tonight Team 
`,
    to: req.body.email
  })

  res.send({ success: 'Payment Created' });
}));

