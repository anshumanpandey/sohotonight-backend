import express from 'express';
import { ApiError } from '../utils/ApiError';
import * as VideoModel from '../models/videoChat.model';
import UserModel, { discountUserToken } from '../models/user.model';

export const createVideoChat: express.RequestHandler<{}, {}, { toUserNickname: string; startWithVoice?: boolean }> =
  async (req, res) => {
    const [u, toUser] = await Promise.all([
      UserModel.findByPk(req.user.id),
      UserModel.findOne({ where: { nickname: req.body.toUserNickname } }),
    ]);

    if (!u) throw new ApiError('User not found');
    if (u.tokensBalance <= 0) throw new ApiError('User has no tokens to start a video chat');
    if (!toUser) throw new ApiError('User to call not found');
    if (u.id.toString() === toUser.id.toString()) throw new ApiError('Cannot create call to itself');

    const onGoingCalls = await VideoModel.getOngoingVideoChats({ relatedUser: [u.id, toUser.id] });
    if (onGoingCalls.length !== 0) {
      throw new ApiError('Person is currently on a call', 409);
    }
    const p = {
      user: u,
      toUser,
      startWithVoice: req.body.startWithVoice !== undefined ? req.body.startWithVoice : false,
    };
    const invitation = await VideoModel.createVideoRoom(p);

    res.send(invitation);
  };

export const discountForVideoChat = async ({ callId, user }: { callId: string; user: any }) => {
  const u = await UserModel.findByPk(user.id);
  if (!u) throw new ApiError('User not found');

  const currentVideoChats = await VideoModel.getOngoingVideoChats();
  const foundChat = currentVideoChats.find((v) => v.id.toString() === callId.toString());
  if (!foundChat)
    throw new ApiError(`Video chat [${callId}] not found on array of ${currentVideoChats.length} results`);

  if (u.tokensBalance === 0) {
    await VideoModel.endVideoChat({ videoChat: foundChat });
    return;
  }

  await discountUserToken({ user: u });
};

export const onChatEnd = (videoChat: any): void => {
  VideoModel.endVideoChat({ videoChat });
};

export const stopVideoBroadcast = (body: any): void => {
  VideoModel.setVideoBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: false });
};

export const resumeVideoBroadcast = (body: any): void => {
  VideoModel.setVideoBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: true });
};

export const stopVideoAudioBroadcast = (body: any): void => {
  VideoModel.setVideoAudioBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: false });
};

export const resumeVideoAudioBroadcast = (body: any): void => {
  VideoModel.setVideoAudioBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: true });
};
