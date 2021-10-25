import express from 'express';
import { ApiError } from '../utils/ApiError';
import * as VideoModel from '../models/videoChat.model';
import UserModel, { discountUserToken, USER_ROLE_ENUM } from '../models/user.model';
import { createMessage, CreateMessageParams, MESSAGES_EVENT_ENUM } from '../models/Message.model';
import { createConversation, getConversationBy } from '../models/Conversation.model';
import { sendNotificatioToUserId } from '../socketApp';

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
      throw new ApiError('User is currently on a call', 409);
    }

    if (toUser.isLogged === false) {
      if (toUser.role === USER_ROLE_ENUM.MODEL) {
        let [conversation] = await getConversationBy({ implicatedUserId: toUser.id });

        if (!conversation) {
          conversation = await createConversation({
            createdByUserId: u.id,
            toUserId: toUser.id,
          });
        }
        const newMessageParams: CreateMessageParams = {
          conversation,
          body: `Missed call from ${u.nickname}`,
          createdByUser: u,
        };
        createMessage(newMessageParams).then(() => {
          sendNotificatioToUserId({
            userId: toUser.id,
            eventName: MESSAGES_EVENT_ENUM.NEW_MESSAGE,
            body: toUser.toJSON(),
          });
        });
      }
      throw new ApiError('User is not online', 409);
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
