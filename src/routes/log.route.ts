import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import { checkSchema } from "express-validator"
import { validateParams } from '../middlewares/routeValidation.middleware';
import * as LogController from '../controllers/log.controller';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';

export const logRoutes = express();

logRoutes.post('/', JwtMiddleware({ credentialsRequired: false }), validateParams(checkSchema({
  body: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
})), asyncHandler(LogController.createLog));
