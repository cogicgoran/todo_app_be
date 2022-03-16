import express from 'express';
import { ControllerInterface } from '../../Interface/controller.interface';

class WildcardController implements ControllerInterface {
    public path = `${process.env.API}*`;
    public router = express.Router();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get(this.path, this.sendAPIWildcard)
    }

    private sendAPIWildcard(request: any, response: any) {
        return response.send("404 Not Found");
    }
}

export default WildcardController;