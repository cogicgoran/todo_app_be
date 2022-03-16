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
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./controller"));
const HttpException_1 = __importDefault(require("../../Exceptions/HttpException"));
const InvalidTaskIdException_1 = __importDefault(require("../../Exceptions/tasks/InvalidTaskIdException"));
const NoTaskIdMatchException_1 = __importDefault(require("../../Exceptions/tasks/NoTaskIdMatchException"));
const NoTasksFoundException_1 = __importDefault(require("../../Exceptions/tasks/NoTasksFoundException"));
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Task_1 = __importDefault(require("../Model/Task"));
const Todo_1 = require("../../Database/Service/Todo");
const OPTIONS_PATH = Object.freeze({
    ALL: 'all',
    ONGOING: 'ongoing',
    COMPLETED: 'completed'
});
class TodoController extends controller_1.default {
    constructor() {
        super();
        this.path = `${process.env.API}todo`;
        this.router = express_1.default.Router();
        this.handlePutTask = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { taskId } = request.params;
            const taskData = request.body;
            try {
                const result = yield Todo_1.TodoService.findTaskByTaskIdAndUserId(taskId, request.session.user_id);
                if (!result)
                    return next(new NoTaskIdMatchException_1.default());
                Object.assign(result, taskData);
                result.save();
                response.status(201).send({
                    status: 201,
                    message: "Successfully updated task!",
                    task: result
                });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.handlePatchTask = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { taskId } = request.params;
            try {
                const result = yield Todo_1.TodoService.findTaskByTaskIdAndUserId(taskId, request.session.user_id);
                if (!result)
                    return next(new NoTaskIdMatchException_1.default());
                // reverses the completed value
                result.completed = !result.completed;
                result.save();
                response.status(201).send({
                    status: 201,
                    message: "Successfully patched task!",
                    task: result
                });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.handleDeleteOne = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { taskId } = request.params;
            const userId = request.session.user_id;
            try {
                const result = yield Todo_1.TodoService.deleteByTaskIdAndUserId(taskId, userId);
                if (result.deletedCount === 0)
                    return next(new NoTaskIdMatchException_1.default());
                response.status(200).send({
                    status: 200,
                    message: "Successfully deleted task!"
                });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.validateTaskId = (request, response, next) => {
            const { taskId } = request.params;
            const regex = new RegExp(/^[0-9a-fA-F]{24}$/);
            if (!taskId)
                return next(new InvalidTaskIdException_1.default());
            if (!regex.test(taskId))
                return next(new InvalidTaskIdException_1.default());
            next();
        };
        this.handleDeleteAll = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { option } = request.params;
            const userId = request.session.user_id;
            try {
                let result;
                switch (option) {
                    case OPTIONS_PATH.ALL:
                        // result = await todoItemModel.deleteMany({
                        //     user: request.session.user_id
                        // });
                        result = yield Todo_1.TodoService.deleteTasksByUserId(userId);
                        break;
                    case OPTIONS_PATH.ONGOING:
                        result = yield Todo_1.TodoService.deleteTasksByUserId(userId, this.getFilter(option));
                        // result = await todoItemModel.deleteMany({
                        //     user: request.session.user_id,
                        //     completed: false
                        // });
                        break;
                    case OPTIONS_PATH.COMPLETED:
                        result = yield Todo_1.TodoService.deleteTasksByUserId(userId, this.getFilter(option));
                        // result = await todoItemModel.deleteMany({
                        //     user: request.session.user_id,
                        //     completed: true
                        // });
                        break;
                    default:
                    // throw some error
                }
                if (result.deletedCount === 0)
                    next(new NoTasksFoundException_1.default());
                const responseMessage = result.deletedCount > 1
                    ? `Successfully deleted ${result.deletedCount} tasks!`
                    : `Successfully deleted ${result.deletedCount} task!`;
                response.status(200).send({
                    status: 200,
                    message: `${responseMessage}`
                });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.handleGetAll = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const { option } = request.params;
            const filter = this.getFilter(option);
            const userId = request.session.user_id;
            try {
                const results = yield Todo_1.TodoService.findByUserId(userId, filter);
                // const results = await todoItemModel.find({ user: request.session.user_id, ...filter }, 'title message completed _id');
                response.status(200).send({
                    status: 200,
                    message: "Successfully gottened user tasks!",
                    todos: results || []
                });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.handleInsert = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const taskData = request.body;
            const userId = request.session.user_id;
            try {
                yield Todo_1.TodoService.createTask(userId, taskData);
                // await todoItemModel.create({ ...taskData, user: request.session.user_id });
                response.status(201).send({ status: 201, message: "Successfully added a task!" });
            }
            catch (error) {
                next(new HttpException_1.default(500, error.message));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/:option`, this.AuthMiddleware, this.handleGetAll);
        this.router.post(`${this.path}`, this.validatorMiddleware(Task_1.default), this.AuthMiddleware, this.handleInsert);
        this.router.delete(`${this.path}/:option`, this.AuthMiddleware, this.handleDeleteAll);
        this.router.delete(`${this.path}/id/:taskId`, this.validateTaskId, this.AuthMiddleware, this.handleDeleteOne);
        this.router.patch(`${this.path}/id/:taskId`, this.validateTaskId, this.AuthMiddleware, this.handlePatchTask);
        this.router.put(`${this.path}/id/:taskId`, this.validatorMiddleware(Task_1.default), this.validateTaskId, this.AuthMiddleware, this.handlePutTask);
    }
    validatorMiddleware(type) {
        return (request, response, next) => {
            (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(type, request.body), { skipMissingProperties: false })
                .then(errors => {
                if (errors.length > 0) {
                    const message = errors.map((error) => Object.values(error.constraints)).join(', ');
                    next(new HttpException_1.default(400, message));
                }
                else {
                    next();
                }
            });
        };
    }
    getFilter(option) {
        const filter = {};
        switch (option) {
            case OPTIONS_PATH.ONGOING:
                Object.assign(filter, { completed: false });
                break;
            case OPTIONS_PATH.COMPLETED:
                Object.assign(filter, { completed: true });
                break;
            default:
        }
        return filter;
    }
}
exports.default = TodoController;
//# sourceMappingURL=TodoController.js.map