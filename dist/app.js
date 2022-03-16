"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const mongoose_1 = __importDefault(require("mongoose"));
const ErrorHandlingMiddleware_1 = __importDefault(require("./Http/Middleware/ErrorHandlingMiddleware"));
const path_1 = __importDefault(require("path"));
const { NODE_ENV, MONGO_PATH, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_SESSION_COLLECTION_NAME, MONGO_USER, MONGO_URL } = process.env;
const CONNECTION_URL = NODE_ENV === 'production'
    ? `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_URL}`
    : MONGO_PATH;
class App {
    constructor(controllers, port) {
        this.MONGO_STORE_TTL = 60 * 60 * 3; // 3 hours
        this.mongoStore = {
            mongoUrl: CONNECTION_URL,
            dbName: MONGO_DB_NAME,
            collectionName: MONGO_SESSION_COLLECTION_NAME,
            ttl: this.MONGO_STORE_TTL,
            touchAfter: 10,
            crypto: {
                secret: false,
            },
        };
        this.sessionOptions = {
            name: "sessId",
            cookie: {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 3,
            },
            secret: 'testSecret',
            store: connect_mongo_1.default.create(this.mongoStore),
            resave: true,
            saveUninitialized: false
        };
        this.app = (0, express_1.default)();
        this.port = port;
        this.controllers = controllers;
        this.init();
    }
    init() {
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers();
        this.initializeErrorHandlingMiddleware();
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
        this.app.use((0, cookie_parser_1.default)());
        this.app.use((0, express_session_1.default)(this.sessionOptions));
        this.app.use(express_1.default.static(path_1.default.join(__dirname, './public/build')));
    }
    initializeControllers() {
        this.controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }
    initializeErrorHandlingMiddleware() {
        this.app.use(ErrorHandlingMiddleware_1.default);
    }
    connectToTheDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (NODE_ENV === 'development') {
                    yield mongoose_1.default.connect(MONGO_PATH + MONGO_DB_NAME);
                }
                if (NODE_ENV === 'production') {
                    yield mongoose_1.default.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_URL}`);
                }
                // Pass option { autoIndex: false } in production ?
                mongoose_1.default.connection.on('error', error => console.error(error));
                mongoose_1.default.connection.on('disconnected', () => console.log("Disconnected from database"));
                mongoose_1.default.connection.on('open', () => console.log('Successfully connected to database'));
                if (NODE_ENV === 'development') {
                    // FOR TESTING ONLY
                    yield mongoose_1.default.connection.db.dropDatabase();
                    console.log("Dropped db");
                }
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("App running on port ", this.port);
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map