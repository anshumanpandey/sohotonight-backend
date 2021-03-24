import { acceptInvitation } from "../models/invitation.model"
import UserModel, { discountUserToken } from "../models/user.model"
import { ApiError } from "../utils/ApiError"
import { getOngoingVideoChats, endVideoChat } from "../models/videoChat.model"

export const onInvitationAccepted = async (invitation: any) => {
    const i = await acceptInvitation({ invitationId: invitation.id })
}

export const discountForVideoChat = async ({ videoChatId, user }: { videoChatId: string, user: any }) => {
    const u = await UserModel.findByPk(user.id)
    if (!u) throw new ApiError("User not found")

    const currentVideoChats = await getOngoingVideoChats()
    const foundChat = currentVideoChats.find(v => v.id == videoChatId)
    if (!foundChat) throw new ApiError("Video chat not found")

    if (u.tokensBalance == 0) {
        await endVideoChat({ videoChat: foundChat })
        return
    }

    await discountUserToken({ user: u })
}

export const onChatEnd = (videoChat: any) => {
    endVideoChat({ videoChat: videoChat })
}