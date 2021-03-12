const accountSid = 'ACed37e593dbfe02693f10a309d5b7e8d7'; // Your Account SID from www.twilio.com/console
const authToken = '6ed30d8ee2c16d32a98a5b12720a3862';   // Your Auth Token from www.twilio.com/console

import { Twilio } from "twilio"
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