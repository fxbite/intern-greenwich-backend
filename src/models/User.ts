import { Schema, model } from 'mongoose';

export interface UserType {
    email: string;
    password: string;
    name: string;
    address: string;
    isAdmin: boolean;
}

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        address: { type: String, required: true },
        isAdmin: { type: Boolean, required: true }
    },
    {
        timestamps: true
    }
);

export default model('User', UserSchema);
