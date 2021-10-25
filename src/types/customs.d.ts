declare namespace Express {
  interface Request<B = {}> {
    user: { id: string; nickname: string };
    body: B;
    id: string;
  }
}
