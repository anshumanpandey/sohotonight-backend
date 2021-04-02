import express from 'express';
import asyncHandler from "express-async-handler"
import { JwtMiddleware } from '../middlewares/JwtMiddleware';
import { getConversations, createConversation } from '../controllers/conversation.controller';
import { validateParams } from '../middlewares';
import { checkSchema } from 'express-validator';
import { createMessageController } from '../controllers/message.controller';

export const messagesRoute = express();

messagesRoute.get('/', JwtMiddleware(), asyncHandler(getConversations))

messagesRoute.post('/',
  JwtMiddleware(),
  validateParams(checkSchema({
    toUserId: {
      in: ['body'],
      exists: {
        errorMessage: 'Missing field'
      },
      isEmpty: {
        errorMessage: 'Missing field',
        negated: true
      },
      trim: true
    },
  })),
  asyncHandler(createConversation))

messagesRoute.post('/message',
  JwtMiddleware(),
  validateParams(checkSchema({
    body: {
      in: ['body'],
      exists: {
        errorMessage: 'Missing field'
      },
      isEmpty: {
        errorMessage: 'Missing field',
        negated: true
      },
      trim: true
    },
    conversationId: {
      in: ['body'],
      exists: {
        errorMessage: 'Missing field'
      },
      isEmpty: {
        errorMessage: 'Missing field',
        negated: true
      },
      trim: true
    },
  })),
  asyncHandler(createMessageController))