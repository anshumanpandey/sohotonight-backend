import express from 'express';
import jwt from 'express-jwt';
import { getLoggedUserData } from '../models/user.model';

export const JWT_SECRET = process.env.JWT_SECRET || 'aa'

type JwtMiddlewareOpt = {
    credentialsRequired?: boolean,
    ex: 'a'
}
export const JwtMiddleware = (opt?: JwtMiddlewareOpt): express.RequestHandler[] => {
    return [
        jwt({
            secret: JWT_SECRET,
            algorithms: ['HS256'],
            credentialsRequired: opt?.credentialsRequired !== undefined ? opt.credentialsRequired : true, ex: opt?.ex
        }),
        (req,res,next) => {
            getLoggedUserData(req.user.id)
            .then((u) => {
                if (u) {
                    //@ts-expect-error
                    req.user = u
                }
                next();
            })
        }
    ]
}