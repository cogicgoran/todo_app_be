import mongoose from 'mongoose';
import { UserInterface } from '../../Interface/User/User.interface';

const userSchema = new mongoose.Schema<UserInterface>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    resetTokenTriggered: Boolean
});

const userModel = mongoose.model<UserInterface & mongoose.Document>('User', userSchema);
export default userModel;