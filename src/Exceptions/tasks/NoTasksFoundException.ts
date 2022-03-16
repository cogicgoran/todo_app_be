import HttpException from "../HttpException";

class NoTasksFoundException extends HttpException {
    constructor() {
        super(404, "No tasks found");
    }
}

export default NoTasksFoundException;