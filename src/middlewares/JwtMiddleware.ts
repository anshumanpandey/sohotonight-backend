import jwt from 'express-jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'aa'

type JwtMiddlewareOpt = {
    credentialsRequired?: boolean,
    ex: 'a'
}
export const JwtMiddleware = (opt?: JwtMiddlewareOpt) => {
    return jwt({ secret: JWT_SECRET, algorithms: ['HS256'], credentialsRequired: opt?.credentialsRequired !== undefined ? opt.credentialsRequired : true, ex: opt?.ex })
}