"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class WildcardController {
    constructor() {
        this.path = `${process.env.API}*`;
        this.router = express_1.default.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.sendAPIWildcard);
    }
    sendAPIWildcard(request, response) {
        return response.send("404 Not Found");
    }
}
exports.default = WildcardController;
//# sourceMappingURL=APIWildcardController.js.map