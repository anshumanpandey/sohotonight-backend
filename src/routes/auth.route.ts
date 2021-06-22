import express from 'express';
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import * as AuthController from '../controllers/auth.controller';

export const authRoutes = express();

authRoutes.post('/resetPassword', validateParams(checkSchema({
  email: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
})), asyncHandler(AuthController.startPasswordRecovery));

authRoutes.post('/completePassword', validateParams(checkSchema({
  code: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
  password: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
  confirmPassword: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
})), asyncHandler(AuthController.completePasswordRecovery));
