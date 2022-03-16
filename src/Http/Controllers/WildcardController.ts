import express, { Request, Response } from "express";
import { ControllerInterface } from "../../Interface/controller.interface";
import path from "path";

class WildcardController implements ControllerInterface {
  public path = ``;
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("*", this.sendApp);
  }

  private sendApp(request: Request, response: Response): void {
    response.sendFile(path.resolve(__dirname, '../../public/build', 'index.html'));
  }
}

export default WildcardController;
