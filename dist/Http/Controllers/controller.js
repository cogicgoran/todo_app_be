"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthMiddleware_1 = __importDefault(require("../Middleware/AuthMiddleware"));
class Controller {
    constructor() {
        this.AuthMiddleware = AuthMiddleware_1.default;
    }
}
exports.default = Controller;
//# sourceMappingURL=controller.js.map