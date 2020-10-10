import { readFileSync } from "fs"
import { join } from "path"
import { render } from "mustache"
import { createTransport } from "nodemailer"

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail({ email, user }:{ email: string, user:any}) {

    // create reusable transporter object using the default SMTP transport
    let transporter = createTransport({
        service: 'gmail',
        auth: {
            user: 'thelox95@gmail.com',
            pass: 'qhvzmcllegwhguje' // naturally, replace both with your real credentials or an application-specific password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'thelox95@gmail.com', // sender address
        to: "sohotonight.ltd@gmail.com", // list of receivers
        subject: "New User Details", // Subject line
        html: render(
            readFileSync(join(__dirname, '..', 'templates', 'mail.html'), 
            { encoding: 'utf8' }), {
                user,
            }
        ),
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}
