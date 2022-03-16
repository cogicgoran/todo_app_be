import { Request, Response, NextFunction} from 'express';
import UserModel from '../../Database/Models/User.model';
import UnauthorizedException from '../../Exceptions/auth/UnauthorizedException';
import HttpException from '../../Exceptions/HttpException';

// TODO: request type should be type of RequestWithUser
async function AuthMiddleware(request: Request, response: Response, next: NextFunction) {
    const userId = request.session.user_id;
    if(userId == undefined) return next(new UnauthorizedException());
    try {
        const user = await UserModel.findById(userId).exec();
        if(!user) {
            request.cookies.user = null;
            return next(new UnauthorizedException());
        }
        next();
    } catch(error) {
        next(new HttpException(500, error.message));
    }
}

export default AuthMiddleware;