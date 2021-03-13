import express from 'express';
import asyncHandler from "express-async-handler"
import { ApiError } from '../utils/ApiError';
import { generateVoiceCallToken, responseCall, TWILIO_INTERNAL_NUM } from '../utils/TwilioClient';

export const callRoutes = express();


callRoutes.get('/generateCallToken', asyncHandler(async (req, res) => {
  const callToken = await generateVoiceCallToken()
  if (!callToken) throw new ApiError("Could not generate token")

  res.send({ token: callToken.toJwt() });
}));

callRoutes.post('/responseCall', asyncHandler(async (req, res) => {
  console.log(req.body)
  const response = responseCall()

  res.set('Content-Type', 'text/xml');
  res.send(response.toString());
}));

