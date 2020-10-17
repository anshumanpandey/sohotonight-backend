import express from 'express';
import { postRoutes } from './post.route';
import { userRoutes } from './user.route';

export const routes = express();

routes.use("/user",userRoutes)
routes.use("/post",postRoutes)
