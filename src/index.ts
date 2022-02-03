import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

const main = async () => {
    // create instance of MikroORM, checkout init() -> returns a Promise
    const orm = await MikroORM.init({
        entities: [],
        dbName: 'lireddit',
        user: '',
        password: '',
        type: 'postgresql',
        // if we're not in production, turn debugging ON
        debug: !__prod__,
    });
};

main();