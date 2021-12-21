import { Logger } from '../utils/Logger';
import { AwsSignalingClientEvents, SocketEmitEvents } from './SocketEvents';
import ConnectionManager from './ConectionManager';

type Events = keyof SocketEmitEvents;

type SendNotificatioToUserIdParams = {
  userId: string | number;
  eventName: Events | AwsSignalingClientEvents;
  body: unknown;
};
export const SendNotificatioToUserId = ({ userId, eventName, body }: SendNotificatioToUserIdParams): void => {
  const conn = ConnectionManager.getConnectionForUser(userId);
  if (!conn) {
    Logger.info(`connection for user ${userId} not found`);
    return;
  }

  Logger.info(`sending event [${eventName}] to user ${userId}`);
  conn.emit(eventName, body);
};

export default SendNotificatioToUserId;
