import express, { Request, Response, NextFunction, response } from 'express';
import { ControllerInterface } from '../../Interface/controller.interface';
import userModel from '../../Database/Models/User.model';
import UserAlreadyExistsException from '../../Exceptions/auth/UserAlreadyExistsException';
import Controller from './controller';
import InvalidCredentialsException from '../../Exceptions/auth/InvalidCredentialsException';
import HttpException from '../../Exceptions/HttpException';
import UserRegistrationDTO from '../Model/UserRegister';
import UserLoginDTO from '../Model/UserLogin';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcryptjs';

declare module 'express-session' {
    export interface SessionData {
        user_id: string;
    }
}

class AuthController extends Controller implements ControllerInterface {
    public path = `${process.env.API}users`
    public router = express.Router()
    public salt = 10

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.validation(UserRegistrationDTO), this.handleRegister);
        this.router.post(`${this.path}/login`, this.validation(UserLoginDTO), this.handleLogin);
        this.router.post(`${this.path}/logout`, this.handleLogout);
    }

    private validation(type: any): express.RequestHandler {
        return (request, response, next) => {
            
            validate(plainToInstance(type, request.body), { skipMissingProperties: false })
                .then(errors => {
                    if (errors.length > 0) {
                        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
                        next(new HttpException(400, message));
                    } else {
                        next();
                    }
                });
        };
    }

    private handleLogin = async (request: Request, response: Response, next: NextFunction) => {
        const userData: UserLoginDTO = request.body;
        try {
            const user = await userModel.findOne({ email: userData.email });
            if (!user) return next(new InvalidCredentialsException());
            const comparisonResponse = await bcrypt.compare(userData.password, user.password);
            if(!comparisonResponse) return next(new InvalidCredentialsException());
            request.session.user_id = user._id;
            response.cookie('user', {username: user.username});
            response.status(200).send({ status: 200, message: "Successfully logged in!", user:{username: user.username} });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private handleLogout = async (request: Request, response: Response, next: NextFunction) => {
        request.session.destroy((error) => {
            if (error) {
                next(new HttpException(500, 'Could not delete session'));
            } else {
                response.clearCookie('user');
                response.status(200).send({ status: 200, message: "Successfully logged out" });
            }
        });
    }

    private handleRegister = async (request: Request, response: Response, next: NextFunction) => {
        const userData: UserRegistrationDTO = request.body;
        try {
            if (await this.getUserByEmail(userData.email)) return next(new UserAlreadyExistsException());
            userData.password = await bcrypt.hash(userData.password, this.salt);
            const user = await userModel.create(userData);
            request.session.user_id = user._id;
            response.cookie('user', {username: userData.username});
            response.status(201).send({ status: 201, message: "Successfully added user!", user:{username:userData.username} });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private getUserByEmail(email: string) {
        return userModel.findOne({ email }).exec();
    }
}

export default AuthController;