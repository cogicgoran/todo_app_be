import HttpException from "../HttpException"

class UserAlreadyExistsException extends HttpException {
    constructor(){
        super(400, "User already exists");
    }
}

export default UserAlreadyExistsException;