"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class WildcardController {
    constructor() {
        this.path = ``;
        this.router = express_1.default.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("*", this.sendApp);
    }
    sendApp(request, response) {
        response.sendFile(path_1.default.resolve(__dirname, '../../public/build', 'index.html'));
    }
}
exports.default = WildcardController;
//# sourceMappingURL=WildcardController.js.map