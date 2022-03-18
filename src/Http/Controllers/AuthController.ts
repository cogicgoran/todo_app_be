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
import crypto from 'crypto';
import UserPasswordResetDTO from '../Model/UserResetPassword';
import MailService from '../Services/sendgrid';

declare module 'express-session' {
    export interface SessionData {
        user_id: string;
    }
}

class AuthController extends Controller implements ControllerInterface {
    public path = `${process.env.API}users`
    public router = express.Router()
    public salt = 10
    public RESET_PASWORD_EXPIRATION_TOKEN = 1000 * 60 * 15 // 15 minutes

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.validation(UserRegistrationDTO), this.handleRegister);
        this.router.post(`${this.path}/login`, this.validation(UserLoginDTO), this.handleLogin);
        this.router.post(`${this.path}/logout`, this.handleLogout);
        this.router.post(`${this.path}/password-reset`, this.validation(UserPasswordResetDTO), this.resetPassword);
        this.router.post(`${this.path}/password-reset/:tokenId`, this.validation(UserLoginDTO), this.triggerToken)
    }

    private triggerToken = async (request: Request, response: Response, next: NextFunction) => {
        const { tokenId } = request.params;
        console.log("token:", tokenId);
        
        const userData: UserLoginDTO = request.body;
        try {
            const user = await userModel.findOne({ email: userData.email, resetToken: tokenId, resetTokenExpiration: { $gt: Date.now() } });
            if (user) {
                const hashedPassword = await bcrypt.hash(userData.password, this.salt);
                user.password = hashedPassword;
                await user.save();
                return response.status(201).json({status:201, message: "Successfully updated password"});
            }
            next(new HttpException(404, 'No token found'));

        } catch (error) {
            next(new HttpException(500, error.message))
        }
    }

    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const userEmail: UserPasswordResetDTO = request.body;
        try {
            const user = await userModel.findOne({ email: userEmail.email });
            if (!user) {
                const message = `
                <p>You (or someone) have requested password reset.</p>
                <p>You don't have an account created.</p>
                <p>If you haven't requested this password reset. Please ignore this email</p>
                `
                await new MailService(userEmail.email, 'Todo App Password Reset', message).send();
                return response.status(200).send({ status: 200, message: "Email should be sent" });
            };

            crypto.randomBytes(32, async (err, buffer) => {
                if (err) return next(new HttpException(500, 'Error sending email'));
                // Send email
                const token = buffer.toString('hex');
                user.resetToken = token;
                user.resetTokenExpiration = new Date(Date.now() + this.RESET_PASWORD_EXPIRATION_TOKEN);
                await user.save();
                const domain = 'localhost:4040';
                const resetUrl = `http://${domain}${process.env.API}password-reset/${token}`;
                const message = `
                <p>You have requested password reset</p>
                <p><a href="${resetUrl}">Set your new password</a></p>
                <p>If you haven't initiated this password reset. Please ignore this email</p>
                `;
                await new MailService(userEmail.email, 'Todo App Password Reset', message).send();
                response.status(200).send({ status: 200, message: "Email should be sent" });
            })
        } catch (error) {
            next(new HttpException(500, error.message));
        }
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
            if (!comparisonResponse) return next(new InvalidCredentialsException());
            request.session.user_id = user._id;
            response.cookie('user', { username: user.username });
            response.status(200).send({ status: 200, message: "Successfully logged in!", user: { username: user.username } });
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
            response.cookie('user', { username: userData.username });
            response.status(201).send({ status: 201, message: "Successfully added user!", user: { username: userData.username } });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private getUserByEmail(email: string) {
        return userModel.findOne({ email }).exec();
    }
}

export default AuthController;