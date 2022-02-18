import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
  // '?:' means sometimes it can be undefined
  // req: Request & {
  //   session: Session & Partial<SessionData> & { UserID: number };
  // };
  req: Request & { session: { userId: any } };
  // req: Request & {
  //   session: Session & Partial<SessionData> & { userId?: any };
  // };
  redis: Redis;
  res: Response;
};
