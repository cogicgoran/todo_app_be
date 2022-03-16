"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const app_1 = __importDefault(require("./app"));
const AuthController_1 = __importDefault(require("./Http/Controllers/AuthController"));
const TodoController_1 = __importDefault(require("./Http/Controllers/TodoController"));
const WildcardController_1 = __importDefault(require("./Http/Controllers/WildcardController"));
// TODO: Add Sessions
const app = new app_1.default([
    new AuthController_1.default,
    new TodoController_1.default,
    new WildcardController_1.default
], process.env.PORT);
app.listen();
//# sourceMappingURL=index.js.map