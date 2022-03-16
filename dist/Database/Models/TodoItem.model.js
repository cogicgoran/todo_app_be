"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const todoItemSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    },
    user: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});
const todoItemModel = mongoose_1.default.model('TodoItem', todoItemSchema);
exports.default = todoItemModel;
//# sourceMappingURL=TodoItem.model.js.map