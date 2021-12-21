import { SocketConnection } from './SocketEvents';

type AuthSocketFunction<T> = (p: { user: { id: number } } & T) => void;

const IncludeUserData =
  (conn: SocketConnection) =>
  <T>(cb: AuthSocketFunction<T>) => {
    return (e: T): void => cb({ ...e, user: conn.decoded_token });
  };

export default IncludeUserData;
