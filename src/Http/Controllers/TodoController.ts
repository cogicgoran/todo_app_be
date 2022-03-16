import express, { NextFunction, Response, Request } from 'express';
import { ControllerInterface } from '../../Interface/controller.interface';
import todoItemModel from '../../Database/Models/TodoItem.model';
import Controller from './controller';
import HttpException from '../../Exceptions/HttpException';
import InvalidTaskIdException from '../../Exceptions/tasks/InvalidTaskIdException';
import NoTaskIdMatchException from '../../Exceptions/tasks/NoTaskIdMatchException';
import NoTasksFoundException from '../../Exceptions/tasks/NoTasksFoundException';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import TaskDTO from '../Model/Task';
import { TodoService } from '../../Database/Service/Todo';

const OPTIONS_PATH = Object.freeze({
    ALL: 'all',
    ONGOING: 'ongoing',
    COMPLETED: 'completed'
})


class TodoController extends Controller implements ControllerInterface {
    public path = `${process.env.API}todo`
    public router = express.Router()

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:option`, this.AuthMiddleware, this.handleGetAll);
        this.router.post(`${this.path}`, this.validatorMiddleware(TaskDTO), this.AuthMiddleware, this.handleInsert);
        this.router.delete(`${this.path}/:option`, this.AuthMiddleware, this.handleDeleteAll);
        this.router.delete(`${this.path}/id/:taskId`, this.validateTaskId, this.AuthMiddleware, this.handleDeleteOne);
        this.router.patch(`${this.path}/id/:taskId`, this.validateTaskId, this.AuthMiddleware, this.handlePatchTask);
        this.router.put(`${this.path}/id/:taskId`, this.validatorMiddleware(TaskDTO), this.validateTaskId, this.AuthMiddleware, this.handlePutTask);
    }

    private handlePutTask = async (request: Request, response: Response, next: NextFunction) => {
        const { taskId } = request.params;
        const taskData: TaskDTO = request.body;
        try {
            const result = await TodoService.findTaskByTaskIdAndUserId(taskId, request.session.user_id);
            if (!result) return next(new NoTaskIdMatchException());
            Object.assign(result, taskData);
            result.save();
            response.status(201).send({
                status: 201,
                message: "Successfully updated task!",
                task: result
            });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private handlePatchTask = async (request: Request, response: Response, next: NextFunction) => {
        const { taskId } = request.params;
        try {
            const result = await TodoService.findTaskByTaskIdAndUserId(taskId, request.session.user_id);
            if (!result) return next(new NoTaskIdMatchException());
            // reverses the completed value
            result.completed = !result.completed;
            result.save();
            response.status(201).send({
                status: 201,
                message: "Successfully patched task!",
                task: result
            });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private handleDeleteOne = async (request: Request, response: Response, next: NextFunction) => {
        const { taskId } = request.params;
        const userId = request.session.user_id;
        try {
            const result = await TodoService.deleteByTaskIdAndUserId(taskId, userId);
            if (result.deletedCount === 0) return next(new NoTaskIdMatchException());
            response.status(200).send({
                status: 200,
                message: "Successfully deleted task!"
            });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private validateTaskId = (request: Request, response: Response, next: NextFunction) => {
        const { taskId } = request.params;
        const regex = new RegExp(/^[0-9a-fA-F]{24}$/);

        if (!taskId) return next(new InvalidTaskIdException());
        if (!regex.test(taskId)) return next(new InvalidTaskIdException());
        next();
    }

    private validatorMiddleware(type: any): express.RequestHandler {
        return (request, response, next) => {
            validate(plainToInstance(type, request.body), { skipMissingProperties: false })
                .then(errors => {
                    if (errors.length > 0) {
                        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
                        next(new HttpException(400, message));
                    } else {
                        next();
                    }
                });
        };
    }

    private handleDeleteAll = async (request: Request, response: Response, next: NextFunction) => {
        const { option } = request.params;
        const userId = request.session.user_id;
        try {
            let result;
            switch (option) {
                case OPTIONS_PATH.ALL:
                    // result = await todoItemModel.deleteMany({
                    //     user: request.session.user_id
                    // });
                    result = await TodoService.deleteTasksByUserId(userId)
                    break;
                case OPTIONS_PATH.ONGOING:
                    result = await TodoService.deleteTasksByUserId(userId, this.getFilter(option));
                    // result = await todoItemModel.deleteMany({
                    //     user: request.session.user_id,
                    //     completed: false
                    // });
                    break;
                case OPTIONS_PATH.COMPLETED:
                    result = await TodoService.deleteTasksByUserId(userId, this.getFilter(option));
                    // result = await todoItemModel.deleteMany({
                    //     user: request.session.user_id,
                    //     completed: true
                    // });
                    break;
                default:
                // throw some error
            }
            if (result.deletedCount === 0) next(new NoTasksFoundException());
            const responseMessage = result.deletedCount > 1
                ? `Successfully deleted ${result.deletedCount} tasks!`
                : `Successfully deleted ${result.deletedCount} task!`;
            response.status(200).send({
                status: 200,
                message: `${responseMessage}`
            });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private getFilter(option?: string) {
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

    private handleGetAll = async (request: Request, response: Response, next: NextFunction) => {
        const { option } = request.params;
        const filter = this.getFilter(option);
        const userId = request.session.user_id;
        try {
            const results = await TodoService.findByUserId(userId, filter);
            // const results = await todoItemModel.find({ user: request.session.user_id, ...filter }, 'title message completed _id');
            response.status(200).send({
                status: 200,
                message: "Successfully gottened user tasks!",
                todos: results || []
            });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }

    private handleInsert = async (request: Request, response: Response, next: NextFunction) => {
        const taskData: TaskDTO = request.body;
        const userId = request.session.user_id;
        try {
            await TodoService.createTask(userId, taskData);
            // await todoItemModel.create({ ...taskData, user: request.session.user_id });
            response.status(201).send({ status: 201, message: "Successfully added a task!" });
        } catch (error) {
            next(new HttpException(500, error.message));
        }
    }
}

export default TodoController;