import HttpException from "../HttpException"

class UnauthorizedException extends HttpException {
    constructor(){
        super(401, "Unauthorized access");
    }
}

export default UnauthorizedException;