import express from 'express';
import asyncHandler from "express-async-handler"
import { ApiError } from '../utils/ApiError';
import { generateVideoCallToken, responseCall, TWILIO_INTERNAL_NUM, createVideoRoom } from '../utils/TwilioClient';
import { JwtMiddleware } from '../utils/JwtMiddleware';
import UserModel, { discountUserToken } from '../models/user.model';
import { getOngoingVideoChats, endVideoChat } from '../models/videoChat.model';
import { checkSchema } from 'express-validator';
import { validateParams } from '../middlewares';
import { getInvitationsByUserInvitatedId, videoChatInvitationSerializer, declineInvitation, acceptInvitation } from '../models/videochatInvitation.model';

export const videoRoutes = express();

videoRoutes.get('/invitations', JwtMiddleware(), asyncHandler(async (req, res) => {

  const invitations = await getInvitationsByUserInvitatedId({ userId: req.user.id })
  res.send(invitations.map(videoChatInvitationSerializer));
}));

videoRoutes.post('/invitation/reject', JwtMiddleware(), asyncHandler(async (req, res) => {

  await declineInvitation({ invitationId: req.body.invitationId })
  res.send({ success: true })
}));

videoRoutes.post('/invitation/accept', JwtMiddleware(), asyncHandler(async (req, res) => {

  await acceptInvitation({ invitationId: req.body.invitationId })
  res.send({ success: true })
}));


videoRoutes.post('/generateVideoToken', JwtMiddleware(), asyncHandler(async (req, res) => {

  const p = { identity: req.body.identity, roomName: req.body.roomName }
  const callToken = await generateVideoCallToken(p)
  if (!callToken) throw new ApiError("Could not generate token")

  res.send({ token: callToken.toJwt() });
}));

videoRoutes.post('/create', JwtMiddleware(), validateParams(checkSchema({
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
  identity: {
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
  if (u.tokensBalance <= 0) throw new ApiError("User has no tokens to start a video chat")
  if (!toUser) throw new ApiError("User to call not found")
  if (u.id == toUser.id) throw new ApiError("Cannot create call to itself")

  const p = { identity: req.body.identity, user: u, toUser }
  const room = await createVideoRoom(p)
  if (!room.token) throw new ApiError("Could not generate token")

  res.send({ token: room.token.toJwt(), ...room.videoChat.toJSON() });
}));


videoRoutes.post('/discount', JwtMiddleware(), asyncHandler(async (req, res) => {

  const u = await UserModel.findByPk(req.user.id)
  if (!u) throw new ApiError("User not found")

  const currentVideoChats = await getOngoingVideoChats()
  const foundChat = currentVideoChats.find(v => v.id == req.body.videoChatId)
  if (!foundChat) throw new ApiError("Video chat not found")  

  if (u.tokensBalance == 0) {
    await endVideoChat({ videoChat: foundChat })
  }

  await discountUserToken({ user: u })

  res.send({ success: "Discounted" });
}));


