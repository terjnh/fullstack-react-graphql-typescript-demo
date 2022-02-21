# README 
- Following Ben Awad's FullStack Tut:
  - https://www.youtube.com/watch?v=I6ypD7qv3Z8
  - [10:03:45] SSR Cookie forwarding
- Github Link: https://github.com/benawad/lireddit


### VSCode Extensions:
- Bracket Pair Colorizer 2
- Docker
- GraphQL for VSCode
- Prettier - Code formatter
- Vim (Optional)

### TO START-UP SERVER
- $ yarn watch
  - Compile Typescript code to Javascript
- $ npx mikro-orm migration:create
  - Run Migrations on schema
- $ yarn dev



### Steps
1. Initialize project
    $ npm init -y

2. Check node is installed
    $ node -v
    and yarn
    $ yarn -v

3. $ yarn add -D @types/node typescript
   - In package.json:
    "scripts": {
        "start": "ts-node src/index.ts"
        },

4. We need ts-node
    $ yarn add -D ts-node

5. $ npx tsconfig.json
        terry@terry-VirtualBox:~/React/fullstack$ npx tsconfig.json
        Need to install the following packages:
        tsconfig.json
        Ok to proceed? (y) y
        ? Pick the technology you're using: node(Default)
        tsconfig.json successfully created

6. Update package.json to:
    "scripts": {
    "watch": "tsc -w",
    "start": "ts-node src/index.ts"
  },

    - Then, when we run `$ yarn watch`...
      - dist directory will be formed, with `index.js` and `index.js.map`
    - This takes our Typescript code, and changes it to javascript, so when we build for production, it is not in Typescript
    - Now to run this code, we can just do this:
      - $ node dist/index.js

7. Install nodemon
  - $ yarn add -D nodemon

#### 2 Terminals 
Terminal 1: $ yarn watch
  - Recompile typescript to JS code
Terminal 2: $ yarn dev
  - Execute app through nodemon - hot reload

8. Install postgresql
  - sudo snap install postgresql96
  - sudo apt install postgresql-client-common
  - sudo apt-get install postgresql-client

- Enter psql terminal:
  - $ sudo -u postgres psql

9. Install mikro-orm
  - $ yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg
  - (note: we are using postgresql for this tutorial)

10. Create postgresql database
  - $ sudo -u postgres createuser terry
  - $ sudo -u postgres createdb -O terry lireddit

11. Run mikro-orm migrate
  - $ npx mikro-orm migration:create
    - package.json: created `yarn create:migration` to handle the above command
  - Note: Ensure `user` and `password` is set in 'mikro-orm.config.ts'
  - If successful, Migration<someNumbers>.ts will be created in './src/migrations/'
    - Migration looks up our PostgreSQL database, and making sure our entities match with it
s
12. Setting up server (graphql, apollo)
  - $ yarn add express apollo-server-express graphql type-graphql
  - $ yarn add -D @types/express


13. Reflect-metadata
  - $ yarn add reflect-metadata

14. Install Argon2 for password hashing
  - $ yarn add argon2

15. Session Authentication
  - Store a cookie in the user's browser, use sessions for authentication to keep track of logged-in user.
  - In this case, we will use `redis` as it is fast
    - To install redis: https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04
  - We will use this middleware: https://github.com/tj/connect-redis
    - $ yarn add redis connect-redis express-session
  - Install the types:
    - $ yarn add -D @types/redis @types/express-session @types/connect-redis
  
16. Add cors
  - $ yarn add cors
  - $ yarn add -D @types/cors

17. Install nodemailer (for emails)
  - $ yarn add nodemailer
  - $ yarn add -D @types/nodemailer

** Adding new field(column) to database (eg. email)
- Previous users did not have email, hence running `yarn create:migration` then `yarn:dev` will result in compilation error
- one solution: remove all previous users from DB:
  - add `await orm.em.nativeDelete(User, {});` into index.ts before
        `await orm.getMigrator().up();`


18. Install uuid and ioredis
  - uuid for generating unique tokens
  - $ yarn add uuid ioredis
  - $ yarn add -D @types/uuid @types/ioredis


19. Switch to TypeORM from mikroORM
  - $ yarn add typeorm
  - Documentation for typeORM: https://typeorm.io
  - in lireddit-server directory:
    - $ createdb lireddit2
    - lireddit2 database will be created in psql (check pgAdmin4 - http://127.0.0.1/pgadmin4/)

  - Remove mikroORM
  - $ yarn remove @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql


20. Pagination
  - We should use cursor-based pagination

21. Creating fakeposts migration
  - $ npx typeorm migration:create -n FakePosts


### PgAdmin4:
- Need to install pgAdmin web browser first
http://127.0.0.1/pgadmin4/
User - email.lightarray@gmail.com (!QAZ2wsx3edc)

### src/entities:
- Refer to https://typegraphql.com/