import express from 'express';
import asyncHandler from 'express-async-handler';
import * as InvitationCtr from '../controllers/invitation.controller';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';

export const invitationRoute = express();

invitationRoute.post('/create', JwtMiddleware(), asyncHandler(InvitationCtr.CreateInvitationController));

invitationRoute.post('/accept', JwtMiddleware(), asyncHandler(InvitationCtr.AcceptInvitationController));

invitationRoute.post('/cancel', JwtMiddleware(), asyncHandler(InvitationCtr.CancelInvitationController));

invitationRoute.post('/reject', JwtMiddleware(), asyncHandler(InvitationCtr.RejectInvitationController));
