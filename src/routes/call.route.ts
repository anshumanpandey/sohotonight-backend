import express from 'express';
import asyncHandler from "express-async-handler"
import { ApiError } from '../utils/ApiError';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { validateParams } from '../middlewares';
import { checkSchema } from 'express-validator';
import UserModel from '../models/user.model';
import { createVoiceCall } from '../models/voiceCall.model';
import { getVoiceInvitationsByUserInvitatedId, invitationSerializer } from '../models/invitation.model';

export const callRoutes = express();

callRoutes.post('/create', JwtMiddleware(), validateParams(checkSchema({
  toUserNickname: {
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
  const [u, toUser] = await Promise.all([
    UserModel.findByPk(req.user.id),
    UserModel.findOne({ where: { nickname: req.body.toUserNickname }})
  ])
  if (!u) throw new ApiError("User not found")
  if (u.tokensBalance <= 0) throw new ApiError("User has no tokens to start a call")
  if (!toUser) throw new ApiError("User to call not found")
  if (u.id == toUser.id) throw new ApiError("Cannot create call to itself")

  const invitation = await createVoiceCall({ fromUser: u, toUser })

  res.send({ ...invitation.toJSON() });
}));

callRoutes.get('/invitations', JwtMiddleware(), asyncHandler(async (req, res) => {

  const invitations = await getVoiceInvitationsByUserInvitatedId({ userId: req.user.id })
  res.send(invitations.map(invitationSerializer));
}));