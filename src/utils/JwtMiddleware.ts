import jwt from 'express-jwt';

export const JwtMiddleware = () => {
    return jwt({ secret: process.env.JWT_SECRET || 'aa', algorithms: ['HS256'] })
}