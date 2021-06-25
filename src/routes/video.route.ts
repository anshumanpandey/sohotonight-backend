import express from 'express';
import asyncHandler from "express-async-handler"
import { ApiError } from '../utils/ApiError';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import UserModel, { discountUserToken } from '../models/user.model';
import { getOngoingVideoChats, endVideoChat, createVideoRoom } from '../models/videoChat.model';
import { checkSchema } from 'express-validator';
import { validateParams } from '../middlewares';
import { getVideoInvitationsByUserInvitatedId, invitationSerializer, updateExpiredInvitations } from '../models/invitation.model';
import { createVideoChat } from '../controllers/videoChat.controller';

export const videoRoutes = express();

videoRoutes.get('/invitations', JwtMiddleware(), asyncHandler(async (req, res) => {

  let invitations = await getVideoInvitationsByUserInvitatedId({ userId: req.user.id })
  invitations = await updateExpiredInvitations({ invitations })
  res.send(invitations.map(invitationSerializer));
}));

videoRoutes.post('/create', JwtMiddleware(), validateParams(checkSchema({
  toUserNickname: {
    in: ['body'],
    exists: {
      errorMessage: 'Missing field'
    },
  },
  startWithVoice: {
    in: ['body'],
    isBoolean: true
  }
})), asyncHandler(createVideoChat));


videoRoutes.post('/discount', JwtMiddleware(), asyncHandler(async (req, res) => {

  const u = await UserModel.findByPk(req.user.id)
  if (!u) throw new ApiError("User not found")

  const currentVideoChats = await getOngoingVideoChats()
  const foundChat = currentVideoChats.find(v => v.id == req.body.videoChatId)
  if (!foundChat) throw new ApiError("Video chat not found")  

  if (u.tokensBalance == 0) {
    await endVideoChat({ videoChat: foundChat })
    return 
  }

  await discountUserToken({ user: u })

  res.send({ success: "Discounted" });
}));


