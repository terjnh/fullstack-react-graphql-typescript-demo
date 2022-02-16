import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import RedisClient from "@node-redis/client/dist/lib/client";
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";


//
export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  // '?:' means sometimes it can be undefined
  req: Request & {
    session: Session & Partial<SessionData> & { UserID: number };
  };
  redis: Redis;
  res: Response;
};
