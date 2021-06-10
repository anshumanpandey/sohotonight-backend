import express from 'express';
import { createLogRecord } from '../models/log.model';

export const createLog = async(req: express.Request<{}, {}, { body: string }>, res: express.Response) => {
    createLogRecord({ body: req.body.body, userId: req.user.id })
    res.send({ success: true })
}