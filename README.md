# README 
Following Ben Awad's FullStack Tut:
https://www.youtube.com/watch?v=I6ypD7qv3Z8
[18:50] - DB table for Post.ts
ithub Link: https://github.com/benawad/lireddit


### VSCode Extensions:
- Bracket Pair Colorizer 2
- Docker
- GraphQL for VSCode
- Prettier - Code formatter
- Vim (Optional)


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

9. Install mikro-orm
  - $ yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg
  - (note: we are using postgresql for this tutorial)

10. Create postgresql database
  - $ sudo -u postgres createuser terry
  - $ sudo -u postgres createdb -O terry lireddit
