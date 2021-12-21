import * as socket from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Logger } from '../utils/Logger';
import { SocketEmitEvents } from './SocketEvents';

type MapKey = string | number;
type MapValues = socket.Socket<SocketEmitEvents, DefaultEventsMap>;

const ConnectionManager = new Map<MapKey, MapValues>();

const storeUserConnection = ({
  userId,
  socketConn,
}: {
  userId: number;
  socketConn: socket.Socket<DefaultEventsMap, DefaultEventsMap>;
}): void => {
  Logger.info(`storing connection for user ${userId}`);
  ConnectionManager.set(userId, socketConn);
};

const getConnectionForUser = (id: MapKey): MapValues | undefined => {
  return ConnectionManager.get(id);
};

export default {
  getConnectionForUser,
  storeUserConnection,
};
