import { acceptInvitation } from "../models/invitation.model"
import UserModel, { discountUserToken } from "../models/user.model"
import { ApiError } from "../utils/ApiError"
import * as VideoModel from "../models/videoChat.model"


export const discountForVideoChat = async ({ callId, user }: { callId: string, user: any }) => {
    const u = await UserModel.findByPk(user.id)
    if (!u) throw new ApiError("User not found")

    const currentVideoChats = await VideoModel.getOngoingVideoChats()
    const foundChat = currentVideoChats.find(v => v.id == callId)
    if (!foundChat) throw new ApiError("Video chat not found")

    if (u.tokensBalance == 0) {
        await VideoModel.endVideoChat({ videoChat: foundChat })
        return
    }

    await discountUserToken({ user: u })
}

export const onChatEnd = (videoChat: any) => {
    VideoModel.endVideoChat({ videoChat: videoChat })
}

export const stopVideoBroadcast = (body: any) => {
    VideoModel.setVideoBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: false })
}

export const resumeVideoBroadcast = (body: any) => {
    VideoModel.setVideoBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: true })
}

export const stopVideoAudioBroadcast = (body: any) => {
    VideoModel.setVideoAudioBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: false })
}

export const resumeVideoAudioBroadcast = (body: any) => {
    VideoModel.setVideoAudioBroadcast({ videoChat: body.currentVideoChat, user: body.user, broadcast: true })
}