import express from 'express';
import { format } from 'url';

export function getCurrentUrl(req: express.Request) {
  return format({
    protocol: req.protocol,
    host: req.get('host'),
  });
}