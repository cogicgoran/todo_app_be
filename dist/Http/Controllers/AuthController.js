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
const User_model_1 = __importDefault(require("../../Database/Models/User.model"));
const UserAlreadyExistsException_1 = __importDefault(require("../../Exceptions/auth/UserAlreadyExistsException"));
const controller_1 = __importDefault(require("./controller"));
const InvalidCredentialsException_1 = __importDefault(require("../../Exceptions/auth/InvalidCredentialsException"));
const HttpException_1 = __importDefault(require("../../Exceptions/HttpException"));
const UserRegister_1 = __importDefault(require("../Model/UserRegister"));
const UserLogin_1 = __importDefault(require("../Model/UserLogin"));
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthController extends controller_1.default {
    constructor() {
        super();
        this.path = `${process.env.API}users`;
        this.router = express_1.default.Router();
        this.salt = 10;
        this.handleLogin = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = request.body;
            try {
                const user = yield User_model_1.default.findOne({ email: userData.email });
                if (!user)
                    return next(new InvalidCredentialsException_1.default());
                const comparisonResponse = yield bcryptjs_1.default.compare(userData.password, user.password);
                if (!comparisonResponse)
                    return next(new InvalidCredentialsException_1.default());
                request.session.user_id = user._id;
                response.cookie('user', { username: user.username });
                response.status(200).send({ status: 200, message: "Successfully logged in!", user: { username: user.username } });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.handleLogout = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            request.session.destroy((error) => {
                if (error) {
                    next(new HttpException_1.default(500, 'Could not delete session'));
                }
                else {
                    response.clearCookie('user');
                    response.status(200).send({ status: 200, message: "Successfully logged out" });
                }
            });
        });
        this.handleRegister = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = request.body;
            try {
                if (yield this.getUserByEmail(userData.email))
                    return next(new UserAlreadyExistsException_1.default());
                userData.password = yield bcryptjs_1.default.hash(userData.password, this.salt);
                const user = yield User_model_1.default.create(userData);
                request.session.user_id = user._id;
                response.cookie('user', { username: userData.username });
                response.status(201).send({ status: 201, message: "Successfully added user!", user: { username: userData.username } });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/register`, this.validation(UserRegister_1.default), this.handleRegister);
        this.router.post(`${this.path}/login`, this.validation(UserLogin_1.default), this.handleLogin);
        this.router.post(`${this.path}/logout`, this.handleLogout);
    }
    validation(type) {
        return (request, response, next) => {
            (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(type, request.body), { skipMissingProperties: false })
                .then(errors => {
                if (errors.length > 0) {
                    const message = errors.map((error) => Object.values(error.constraints)).join(', ');
                    next(new HttpException_1.default(400, message));
                }
                else {
                    next();
                }
            });
        };
    }
    getUserByEmail(email) {
        return User_model_1.default.findOne({ email }).exec();
    }
}
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map