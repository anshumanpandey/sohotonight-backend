import express from 'express';
import asyncHandler from "express-async-handler"
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { declineInvitation } from '../models/invitation.model';

export const invitationRoute = express();

invitationRoute.post('/reject', JwtMiddleware(), asyncHandler(async (req, res) => {

  await declineInvitation({ invitationId: req.body.invitationId })
  res.send({ success: true })
}));