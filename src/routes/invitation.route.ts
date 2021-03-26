import express from 'express';
import asyncHandler from "express-async-handler"
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { declineInvitation, acceptInvitation } from '../models/invitation.model';
import { ApiError } from '../utils/ApiError';

export const invitationRoute = express();

invitationRoute.post('/accept', JwtMiddleware(), asyncHandler(async (req, res) => {
  if (!req.body.invitationId) throw new ApiError("Missing invitationId")

  const i = await acceptInvitation({ invitationId: req.body.invitationId })
  res.send({ success: true })
}));

invitationRoute.post('/reject', JwtMiddleware(), asyncHandler(async (req, res) => {

  await declineInvitation({ invitationId: req.body.invitationId })
  res.send({ success: true })
}));