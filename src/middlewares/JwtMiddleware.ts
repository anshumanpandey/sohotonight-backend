import jwt from 'express-jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'aa'

export const JwtMiddleware = () => {
    return jwt({ secret: JWT_SECRET, algorithms: ['HS256'] })
}