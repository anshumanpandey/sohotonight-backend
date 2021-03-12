const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_ACCOUNT_TOKEN;   // Your Auth Token from www.twilio.com/console
export const TWILIO_INTERNAL_NUM = "+12564748382"

import { Twilio } from "twilio"
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