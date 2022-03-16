import mongoose from 'mongoose';

interface TodoItemInterface {
    title: string;
    message: string;
    completed: boolean;
    user: mongoose.ObjectId
}

export default TodoItemInterface;