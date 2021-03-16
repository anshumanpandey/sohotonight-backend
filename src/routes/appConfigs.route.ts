import express from 'express';
import asyncHandler from "express-async-handler"
import AppConfig from '../models/appConfig.model';

export const appConfigsRoutes = express();

appConfigsRoutes.get('/get', asyncHandler(async (req, res) => {

  const config = await AppConfig.findAll()
  res.send(config[0]);
}));

