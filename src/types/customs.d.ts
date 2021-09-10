declare namespace Express {
  interface Request<B = {}> {
    user: { id: string };
    body: B;
    id: string;
  }
}
