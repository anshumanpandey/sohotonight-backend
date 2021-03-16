import express from 'express';
var jwt = require('express-jwt');
import asyncHandler from "express-async-handler"
import ServiceModel from '../models/services.model';

export const serviceRoutes = express();

serviceRoutes.get('/', asyncHandler(async (req, res) => {
  res.send(await ServiceModel.findAll());
}));

