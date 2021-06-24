import { readFileSync } from 'fs';
import { resolve } from 'path';
import { render } from 'mustache';

export enum Emailtemplates {
    RecoverPasswordSuccessTemplate = "RecoverPasswordSuccessTemplate",
    RecoverPasswordTemplate = "RecoverPasswordTemplate",
    SuccessTokenBought = "SuccessTokenBought",
}

export const renderHtmlTemaplate = ({ templateName , values }: { templateName: Emailtemplates, values: {[k: string]: any }}) => {
    const path = resolve(__dirname, "..", "..", "templates", `${templateName}.html`)
    const html = readFileSync(path, "utf8")
    return render(html, values)
}