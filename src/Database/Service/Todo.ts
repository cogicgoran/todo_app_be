import todoItemModel from "../Models/TodoItem.model";

export class TodoService {
    static findTaskByTaskIdAndUserId(taskId: string, userId: string) {
        return todoItemModel.findOne({
            _id: taskId,
            user: userId
        });
    }

    static deleteByTaskIdAndUserId(taskId: string, userId: string) {
        return todoItemModel.deleteOne({
            _id: taskId,
            user: userId
        });
    }

    static deleteTasksByUserId(userId: string, filter?: any) {
        return todoItemModel.deleteMany({
            user: userId,
            ...filter
        });
    }

    static findByUserId(userId: string, filter?: any) {
        return todoItemModel.find({
            user: userId,
            ...filter
        }, 'title message completed _id');
    }

    static createTask(userId: string, data: any) {
        return todoItemModel.create({ ...data, user: userId });
    }
}
