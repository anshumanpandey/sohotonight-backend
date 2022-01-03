import express from 'express';
import asyncHandler from 'express-async-handler';
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import * as InvitationModel from '../models/invitation.model';
import { getVideoRoom } from '../models/videoChat.model';
import { ApiError } from '../utils/ApiError';
import { deleteSignalingChannel, getArnChannelNameFrom } from '../utils/AwsKinesisClient';

export const invitationRoute = express();

invitationRoute.post(
  '/accept',
  JwtMiddleware(),
  asyncHandler(async (req, res) => {
    if (!req.body.invitationId) throw new ApiError('Missing invitationId');

    const [invitation] = await InvitationModel.getInvitationsBy({ id: req.body.invitationId });
    if (!invitation) throw new ApiError('Invitation not found');

    if (invitation.responseFromUser === InvitationModel.INVITATION_RESPONSE_ENUM.ACCEPTED) {
      throw new ApiError('Invitation already accepted');
    }

    await InvitationModel.updateInvitationByUserAction({
      invitation,
      action: InvitationModel.INVITATION_RESPONSE_ENUM.ACCEPTED,
    });
    res.send({ success: true });
  }),
);

invitationRoute.post(
  '/cancel',
  JwtMiddleware(),
  asyncHandler(async (req, res) => {
    if (!req.body.invitationId) throw new ApiError('Missing invitationId');

    const [invitation] = await InvitationModel.getInvitationsBy({ id: req.body.invitationId });
    if (!invitation) throw new ApiError('Invitation not found');

    if (invitation.responseFromUser === InvitationModel.INVITATION_RESPONSE_ENUM.CANCELLED) {
      throw new ApiError('Invitation already cancelled');
    }

    await InvitationModel.updateInvitationByUserAction({
      invitation,
      action: InvitationModel.INVITATION_RESPONSE_ENUM.CANCELLED,
    });
    const d = await getVideoRoom({ id: invitation.videoChatId.toString() });
    if (d) {
      try {
        const arnChannelName = await getArnChannelNameFrom(d.uuid);
        await deleteSignalingChannel({ arnChannel: arnChannelName });
      } catch (err) {
        console.log(err);
      }
    }
    res.send({ success: true });
  }),
);

invitationRoute.post(
  '/reject',
  JwtMiddleware(),
  asyncHandler(async (req, res) => {
    if (!req.body.invitationId) throw new ApiError('Missing invitationId');

    const [invitation] = await InvitationModel.getInvitationsBy({ id: req.body.invitationId });
    if (!invitation) throw new ApiError('Invitation not found');

    if (invitation.responseFromUser === InvitationModel.INVITATION_RESPONSE_ENUM.REJECTED) {
      throw new ApiError('Invitation already rejected');
    }
    await InvitationModel.updateInvitationByUserAction({
      invitation,
      action: InvitationModel.INVITATION_RESPONSE_ENUM.REJECTED,
    });
    res.send({ success: true });
  }),
);
