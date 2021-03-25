import UserModel, { discountUserToken } from "../models/user.model"
import { ApiError } from "../utils/ApiError"
import { getOngoingVoiceCall, endVoiceCall } from "../models/voiceCall.model"

export const discountForVoiceCall = async ({ callId, user }: { callId: string, user: any }) => {
    const u = await UserModel.findByPk(user.id)
    if (!u) throw new ApiError("User not found")

    const currentVideoChats = await getOngoingVoiceCall()
    const foundChat = currentVideoChats.find(v => v.id == callId)
    if (!foundChat) throw new ApiError("Voice call not found")

    if (u.tokensBalance == 0) {
        await endVoiceCall({ voiceCall: foundChat })
        return
    }

    await discountUserToken({ user: u })
}


export const onVoiceChatEnd = (voiceCall: any) => {
    endVoiceCall({ voiceCall })
}