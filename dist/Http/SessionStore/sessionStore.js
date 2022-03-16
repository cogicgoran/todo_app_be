"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionOptions = exports.mongoStore = void 0;
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const MONGO_STORE_TTL = 60 * 60 * 3;
const mongoStoreOptions = {
    mongoUrl: 'mongodb://127.0.0.1:27017/',
    dbName: 'testera',
    collectionName: ' sessions',
    ttl: MONGO_STORE_TTL,
    touchAfter: 10,
    crypto: {
        secret: false,
    }
};
exports.mongoStore = connect_mongo_1.default.create(mongoStoreOptions);
exports.sessionOptions = {
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 3,
    },
    secret: 'testSecret',
    store: exports.mongoStore,
    name: "sessId",
};
//# sourceMappingURL=sessionStore.js.map