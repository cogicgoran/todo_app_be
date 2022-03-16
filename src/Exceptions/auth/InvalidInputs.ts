import HttpException from "../HttpException";

class InvalidInputs extends HttpException {
    constructor() {
        super(400, "Invalid inputs");
    }
}

export default InvalidInputs;