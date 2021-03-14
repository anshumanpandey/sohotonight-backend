const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_ACCOUNT_TOKEN;   // Your Auth Token from www.twilio.com/console
export const TWILIO_INTERNAL_NUM = "+12564748382"

import { Twilio, twiml } from "twilio"
import AccessToken, { VideoGrant, VoiceGrant } from "twilio/lib/jwt/AccessToken";
import { SmsModel, SMS_DIRECTION, SMS_SEND_STATUS } from "../models/sms.model";
const twilioClient = new Twilio(accountSid || "", authToken || "");

type SmsParams = { body: string, toPhone: string, from?: string }
export const forwardSms = async ({ body, toPhone, from = TWILIO_INTERNAL_NUM }: SmsParams) => {
    twilioClient.messages.create({
        body,
        to: toPhone,  // Text this number
        from // From a valid Twilio number
    })
    .then((messageInstance) => {
        console.log({ messageInstance })
        return {
            fromNumber: from,
            toNumber: toPhone,
            body,
            direction: SMS_DIRECTION.FORWARD,
            status: SMS_SEND_STATUS.SENDED,
            twilio_sid: messageInstance.sid
        }
    })
    .catch((messageInstanceErr) => {
        console.log({ messageInstanceErr })
        return {
            fromNumber: from,
            toNumber: toPhone,
            body,
            direction: SMS_DIRECTION.FORWARD,
            status: SMS_SEND_STATUS.FAILED_TO_SEND,
            fail_reason: messageInstanceErr.toString()
        }
    })
    .then((data) => SmsModel.create(data))
}

export const createIncomingPhoneNumber = async () => {
    const n = await twilioClient.incomingPhoneNumbers.create({ smsMethod: "POST", smsUrl: "http://3.21.204.83:5000/api/sms/track", areaCode: "407" })
    return n
}

export const generateVoiceCallToken = async ({ identity }: { identity: string }) => {
    if (!accountSid) return null
    if (!process.env.TWILIO_APIKEY_SID) return null
    if (!process.env.TWILIO_APIKEY_SECRET) return null
    if (!process.env.TWILIO_TWIML_SECRET_SID) return null

    const accessToken = new AccessToken(accountSid, process.env.TWILIO_APIKEY_SID, process.env.TWILIO_APIKEY_SECRET);
    accessToken.identity = identity;

    const grant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_SECRET_SID,
        incomingAllow: true,
    });
    accessToken.addGrant(grant);

    return accessToken
}

export const responseCall = ({ recipient }: { recipient: string }) => {
    const twimlResponse = new twiml.VoiceResponse();

    var dial = twimlResponse.dial();
    dial.client({}, recipient);

    return twimlResponse
}

export const generateVideoCallToken = ({ identity, roomName }: { identity: string, roomName: string }) => {
    if (!accountSid) return null
    if (!process.env.TWILIO_VIDEO_APIKEY_SID) return null
    if (!process.env.TWILIO_VIDEO_APIKEY_SECRET) return null

    // Create an Access Token
    var accessToken = new AccessToken(accountSid, process.env.TWILIO_VIDEO_APIKEY_SID, process.env.TWILIO_VIDEO_APIKEY_SECRET);

    // Set the Identity of this token
    accessToken.identity = identity;

    // Grant access to Video
    var grant = new VideoGrant();
    grant.room = roomName;
    accessToken.addGrant(grant);

    // Serialize the token as a JWT
    return accessToken
}