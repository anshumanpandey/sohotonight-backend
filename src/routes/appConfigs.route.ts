import express from 'express';
import asyncHandler from "express-async-handler"
import { AppConfig } from '../models/appConfig.model';
import { ApiError } from '../utils/ApiError';
import { generateVideoCallToken, responseCall, TWILIO_INTERNAL_NUM } from '../utils/TwilioClient';

export const appConfigsRoutes = express();

appConfigsRoutes.get('/get', asyncHandler(async (req, res) => {

  const config = await AppConfig.findAll()
  res.send(config[0]);
}));

