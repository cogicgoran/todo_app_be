import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session, { SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import { ControllerInterface } from './Interface/controller.interface';
import ErrorHandlingMiddleWare from './Http/Middleware/ErrorHandlingMiddleware';
import { ConnectMongoOptions } from 'connect-mongo/build/main/lib/MongoStore';
import path from 'path';
const { NODE_ENV, SESSION_SECRET, MONGO_PATH, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_SESSION_COLLECTION_NAME, MONGO_USER, MONGO_URL } = process.env;
const CONNECTION_URL = NODE_ENV === 'production' 
? `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_URL}`
: MONGO_PATH

export default class App {
    public MONGO_STORE_TTL = 60 * 60 * 3; // 3 hours
    public app: express.Application;
    public port: string;
    public controllers: ControllerInterface[];
    public mongoStore: ConnectMongoOptions = {
        mongoUrl: CONNECTION_URL,
        dbName: MONGO_DB_NAME,
        collectionName: MONGO_SESSION_COLLECTION_NAME,
        ttl: this.MONGO_STORE_TTL,
        touchAfter: 10,
        crypto: {
            secret: false,
        },
    };
    public sessionOptions: SessionOptions = {
        name: "sessId",
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 3,
        },
        secret: SESSION_SECRET,
        store: MongoStore.create(this.mongoStore),
        resave: true,
        saveUninitialized: false
    };

    constructor(controllers: ControllerInterface[], port: string) {
        this.app = express();
        this.port = port;
        this.controllers = controllers;

        this.init();
    }

    private init() {
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers();
        this.initializeErrorHandlingMiddleware();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(cookieParser());
        this.app.use(session(this.sessionOptions));
        this.app.use(express.static(path.join(__dirname, './public/build')));
    }

    private initializeControllers() {
        this.controllers.forEach((controller: ControllerInterface) => {
            this.app.use("/", controller.router);
        });
    }

    private initializeErrorHandlingMiddleware() {
        this.app.use(ErrorHandlingMiddleWare);
    }

    private async connectToTheDatabase() {
        try {
            if (NODE_ENV === 'development') {
                await mongoose.connect(MONGO_PATH + MONGO_DB_NAME);
            }
            if (NODE_ENV === 'production') {
                await mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_URL}`)
            }
            // Pass option { autoIndex: false } in production ?
            mongoose.connection.on('error', error => console.error(error));
            mongoose.connection.on('disconnected', () => console.log("Disconnected from database"));
            mongoose.connection.on('open', () => console.log('Successfully connected to database'));
            if (NODE_ENV === 'development') {
                // FOR TESTING ONLY
                await mongoose.connection.db.dropDatabase();
                console.log("Dropped db");
            }
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log("App running on port ", this.port);
        });
    }
}
