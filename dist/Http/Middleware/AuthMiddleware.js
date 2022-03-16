"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = __importDefault(require("../../Database/Models/User.model"));
const UnauthorizedException_1 = __importDefault(require("../../Exceptions/auth/UnauthorizedException"));
const HttpException_1 = __importDefault(require("../../Exceptions/HttpException"));
// TODO: request type should be type of RequestWithUser
function AuthMiddleware(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = request.session.user_id;
        if (userId == undefined)
            return next(new UnauthorizedException_1.default());
        try {
            const user = yield User_model_1.default.findById(userId).exec();
            if (!user) {
                request.cookies.user = null;
                return next(new UnauthorizedException_1.default());
            }
            next();
        }
        catch (error) {
            next(new HttpException_1.default(500, error.message));
        }
    });
}
exports.default = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map