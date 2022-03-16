import HttpException from "../HttpException";

class InvalidTaskIdException extends HttpException {
    constructor() {
        super(400, "Invalid task id");
    }
}

export default InvalidTaskIdException;