import express from 'express';
import { assetsRoutes } from './assets.route';
import { paymentRoutes } from './payment.route';
import { postRoutes } from './post.route';
import { serviceRoutes } from './services.route';
import { userRoutes } from './user.route';

export const routes = express();

routes.use("/user",userRoutes)
routes.use("/post",postRoutes)
routes.use("/payment",paymentRoutes)
routes.use("/assets",assetsRoutes)
routes.use("/services",serviceRoutes)
