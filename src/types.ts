import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from "express";

//
export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  // '?:' means sometimes it can be undefined
  req: Request & {session: Express.Session};
  res: Response;
};
