import HttpException from "../HttpException";

class NoTaskIdMatchException extends HttpException {
    constructor() {
        super(404, "No task found with given id");
    }
}

export default NoTaskIdMatchException;