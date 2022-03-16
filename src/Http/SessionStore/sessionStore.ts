import { ConnectMongoOptions } from "connect-mongo/build/main/lib/MongoStore";
import MongoStore from "connect-mongo";

const MONGO_STORE_TTL = 60 * 60 * 3;
const mongoStoreOptions: ConnectMongoOptions = {
    mongoUrl: 'mongodb://127.0.0.1:27017/',
    dbName: 'testera',
    collectionName: ' sessions',
    ttl: MONGO_STORE_TTL,
    touchAfter: 10,
    crypto: {
        secret: false,
    }
};

export const mongoStore = MongoStore.create(mongoStoreOptions);

export const sessionOptions = {
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 3,
    },
    secret: 'testSecret',
    store: mongoStore,
    name: "sessId",
};