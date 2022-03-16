import mongoose from 'mongoose';
import TodoItemInterface from '../../Interface/Todo/TodoItem';

const todoItemSchema = new mongoose.Schema<TodoItemInterface>({
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
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const todoItemModel = mongoose.model<TodoItemInterface & mongoose.Document>('TodoItem', todoItemSchema);
export default todoItemModel;