const accountSid = 'ACed37e593dbfe02693f10a309d5b7e8d7'; // Your Account SID from www.twilio.com/console
const authToken = '6ed30d8ee2c16d32a98a5b12720a3862';   // Your Auth Token from www.twilio.com/console
export const TWILIO_INTERNAL_NUM = "+12564748382"

import { Twilio } from "twilio"
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
const client = new Twilio(accountSid, authToken);

type SmsParams = { body: string, to: string, from: string }
export const sendSms = ({ body, to, from }: SmsParams) => {
    return client.messages.create({
        body,
        to,  // Text this number
        from // From a valid Twilio number
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err));
    
}

export const forwardSms = ({ body, to, from }: SmsParams) => {
    const twiml = new MessagingResponse();
    twiml.message({ to, from }, body)
    return twiml
}