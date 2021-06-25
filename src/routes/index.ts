import express from 'express';
import { assetsRoutes } from './assets.route';
import { paymentRoutes } from './payment.route';
import { postRoutes } from './post.route';
import { serviceRoutes } from './services.route';
import { userRoutes } from './user.route';
import { messagesRoute } from './messages.route';
import { videoRoutes } from './video.route';
import { appConfigsRoutes } from './appConfigs.route';
import { invitationRoute } from './invitation.route';
import { logRoutes } from './log.route';
import { authRoutes } from './auth.route';

export const routes = express();

routes.use("/user",userRoutes)
routes.use("/post",postRoutes)
routes.use("/payment",paymentRoutes)
routes.use("/assets",assetsRoutes)
routes.use("/services",serviceRoutes)
routes.use("/chat",messagesRoute)
routes.use("/video",videoRoutes)
routes.use("/appConfigs",appConfigsRoutes)
routes.use("/invitation",invitationRoute)
routes.use("/log",logRoutes)
routes.use("/auth",authRoutes)
