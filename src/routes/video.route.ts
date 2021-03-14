import express from 'express';
import asyncHandler from "express-async-handler"
import { ApiError } from '../utils/ApiError';
import { generateVideoCallToken, responseCall, TWILIO_INTERNAL_NUM } from '../utils/TwilioClient';

export const videoRoutes = express();


videoRoutes.get('/generateVideoToken', asyncHandler(async (req, res) => {

  const p = { identity: req.query.identity?.toString() || "Caller1", roomName: req.query.roomName?.toString() || "RoomA", }
  const callToken = await generateVideoCallToken(p)
  if (!callToken) throw new ApiError("Could not generate token")

  res.send({ token: callToken.toJwt() });
}));

