import express from 'express';
import * as InvitationModel from '../models/invitation.model';
import UserModel, { USER_ROLE_ENUM } from '../models/user.model';
import * as VideoModel from '../models/videoChat.model';
import { ApiError } from '../utils/ApiError';
import { deleteSignalingChannel, getArnChannelNameFrom } from '../utils/AwsKinesisClient';

export const CreateInvitationController: express.RequestHandler<
  {},
  {},
  { toUserNickname: string; startWithVoice?: boolean }
> = async (req, res) => {
  const [fromUser, toUser] = await Promise.all([
    UserModel.findByPk(req.user.id),
    UserModel.findOne({ where: { nickname: req.body.toUserNickname } }),
  ]);

  if (!fromUser) throw new ApiError('User not found');
  if (!toUser) throw new ApiError('User not logged');

  VideoModel.userCanStartCall(fromUser);
  //TODO:debug
  //await VideoModel.userCanReceiveACall(fromUser, toUser);

  const invitation = await InvitationModel.createInvitation({
    toUser,
    byUser: fromUser,
  });

  const notificationParams = {
    toUserId: toUser.id,
    invitation,
    startWithVoice: req.body.startWithVoice || false,
  };

  InvitationModel.sendNewCallNotificationToUser(notificationParams);

  res.send(invitation);
};

export const AcceptInvitationController: express.RequestHandler<
  {},
  {},
  { invitationId: string; startWithVoice?: boolean }
> = async (req, res) => {
  if (!req.body.invitationId) throw new ApiError('Missing invitationId');

  const [invitation] = await InvitationModel.getInvitationsBy({ id: req.body.invitationId });
  if (!invitation) throw new ApiError('Invitation not found');

  if (invitation.responseFromUser === InvitationModel.INVITATION_RESPONSE_ENUM.ACCEPTED) {
    throw new ApiError('Invitation already accepted');
  }

  const roomParams = {
    byUser: invitation.createdByUser,
    invitation: invitation,
    startWithVoice: req.body.startWithVoice === undefined ? false : req.body.startWithVoice,
  };
  const videoRoom = await VideoModel.startChatRoom(roomParams);
  invitation.videoChatId = videoRoom.id;
  await invitation.save();

  const [newInvitation] = await InvitationModel.getInvitationsBy({ id: req.body.invitationId });

  await InvitationModel.updateInvitationByUserAction({
    invitation: newInvitation,
    action: InvitationModel.INVITATION_RESPONSE_ENUM.ACCEPTED,
  });

  const response = {
    id: newInvitation.id,
    videoChat: newInvitation.videoChat,
    receiverUuid: newInvitation.receiverUuid,
    responseFromUser: newInvitation.responseFromUser,
  };
  res.send(response);
};

export const CancelInvitationController: express.RequestHandler<
  {},
  {},
  { invitationId: string; startWithVoice?: boolean }
> = async (req, res) => {
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
  const d = await VideoModel.getVideoRoom({ id: invitation.videoChatId.toString() });
  if (d) {
    const arnChannelName = await getArnChannelNameFrom(d.uuid);
    await deleteSignalingChannel({ arnChannel: arnChannelName });
  }
  res.send({ success: true });
};

export const RejectInvitationController: express.RequestHandler<
  {},
  {},
  { invitationId: string; startWithVoice?: boolean }
> = async (req, res) => {
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
};
