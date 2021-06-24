import express from 'express';
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import AppConfig from '../models/appConfig.model';
import PaymentModel from '../models/payment.model';
import UserModel from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import sequelize from '../utils/DB';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { sendEmail } from '../utils/Mail';
import { renderHtmlTemaplate, Emailtemplates } from '../utils/renderHtmlTemaplate';

export const paymentRoutes = express();

paymentRoutes.post('/create', JwtMiddleware(), validateParams(checkSchema({
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
  await PaymentModel.create({ ...req.body, UserId: req.user.id });

  res.send({ success: 'Payment Created' });
}));

paymentRoutes.post('/tokensPurchase', JwtMiddleware(), validateParams(checkSchema({
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
  await PaymentModel.create({ ...req.body, UserId: req.user.id });

  await sequelize.transaction(async (t) => {
    const config = await AppConfig.findOne({ where: {}, transaction: t });
    
    const user = await UserModel.findOne({ where: { id: req.user?.id } })
    if (!user) throw new ApiError("User not found")

    await UserModel.update({ tokensBalance: user.tokensBalance + ((config?.pricePerToken || 1) * req.body.amount) }, { where: { id: req.user.id }, transaction: t })
    
    const html = renderHtmlTemaplate({
      templateName: Emailtemplates.SuccessTokenBought,
      values: { tokenAmount: req.body.amount, currentDate: new Date().toUTCString() }
    })
    sendEmail({ to: user.emailAddress, html, subject: 'You purchased tokens'})
  })

  res.send({ success: 'Payment Created' });
}));

