import express from 'express';
import { sendEmail } from '../utils/Mail';
import { getUsersBy } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { hash } from "bcrypt"
import { getCurrentUrl } from '../utils/getCurrentUrl';
const generator = require('generate-password');
import { renderHtmlTemaplate, Emailtemplates } from '../utils/renderHtmlTemaplate';

export const startPasswordRecovery = async (req: express.Request<{}, {}, { email: string }>, res: express.Response) => {
    const [u] = await getUsersBy({ emailAddress: req.body.email })
    if (!u) throw new ApiError("Email not found")

    const resetPasswordToken = generator.generate({
        length: 5,
        numbers: true
    });

    await u.update({ resetPasswordToken })

    const verificationUrl = `${getCurrentUrl(req)}/setup-password?code=${resetPasswordToken}`
    const html = renderHtmlTemaplate({ templateName: Emailtemplates.RecoverPasswordTemplate, values: { verificationUrl } })

    await sendEmail({ subject: 'Recover your SohoTonight password!', html, to: u.emailAddress })
    res.send({ success: true })
}

export const completePasswordRecovery = async (req: express.Request<{}, {}, { code: string, password: string, confirmPassword: string }>, res: express.Response) => {
    const { password, confirmPassword, code } = req.body
    if (password != confirmPassword) throw new ApiError("Password not match")

    const [u] = await getUsersBy({ resetPasswordToken: code })
    if (!u) throw new ApiError("User not found")

    const hashedPass = await hash(password, 8)
    await u.update({ password: hashedPass, resetPasswordToken: null })

    const currentDate = new Date().toUTCString()
    const html = renderHtmlTemaplate({ templateName: Emailtemplates.RecoverPasswordSuccessTemplate, values: { currentDate } })
    await sendEmail({ subject: 'Your SohoTonight password has been reset!', html, to: u.emailAddress })
    res.send({ success: true })
}