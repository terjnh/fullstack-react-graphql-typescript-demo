import { MikroORM } from "@mikro-orm/core";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
// import express from "express";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

async function main() {
  // connect to database
  const orm = await MikroORM.init(microConfig);
  // run migrations
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  // redis@v4
  const { createClient } = require("redis");
  // let redis = createClient({ legacyMode: true });
  const redis = new Redis();
  redis.connect().catch(console.error);


  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );

  // session middleware
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // security reasons (JS frontend cannot access cookie)
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https (only in production)
      },
      saveUninitialized: false,
      secret: "somerandomstringfornow",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // force Apollo to use GraphQL Playground so we can adjust settings for cookies:
    //   "request.credentials": "include"
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // options
      }),
    ],
    context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
  });

  // apollo middleware
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: false
    // cors: { origin: "http://localhost:3000/" },
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
}

main().catch((err) => {
  console.error("Error-index.ts:", err);
});
