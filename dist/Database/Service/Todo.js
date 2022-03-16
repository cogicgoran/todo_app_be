"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoService = void 0;
const TodoItem_model_1 = __importDefault(require("../Models/TodoItem.model"));
class TodoService {
    static findTaskByTaskIdAndUserId(taskId, userId) {
        return TodoItem_model_1.default.findOne({
            _id: taskId,
            user: userId
        });
    }
    static deleteByTaskIdAndUserId(taskId, userId) {
        return TodoItem_model_1.default.deleteOne({
            _id: taskId,
            user: userId
        });
    }
    static deleteTasksByUserId(userId, filter) {
        return TodoItem_model_1.default.deleteMany(Object.assign({ user: userId }, filter));
    }
    static findByUserId(userId, filter) {
        return TodoItem_model_1.default.find(Object.assign({ user: userId }, filter), 'title message completed _id');
    }
    static createTask(userId, data) {
        return TodoItem_model_1.default.create(Object.assign(Object.assign({}, data), { user: userId }));
    }
}
exports.TodoService = TodoService;
//# sourceMappingURL=Todo.js.map