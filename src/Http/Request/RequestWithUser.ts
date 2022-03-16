import { Request } from 'express';
import { UserInterface } from '../../Interface/User/User.interface';

interface RequestWithUser extends Request {
    user: UserInterface
}

export default RequestWithUser;