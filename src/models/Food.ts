import { Schema, model } from 'mongoose';

export interface FoodType {
    id: string;
    name: string;
    price: number;
    tags: string[];
    favorite: boolean;
    stars: number;
    imageUrl: string;
    origins: string[];
    cookTime: string;
}

const FoodSchema = new Schema(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        tags: [{ type: String }],
        favorite: { type: Boolean, default: false },
        stars: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        origins: [{ type: String, required: true }],
        cookTime: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export default model('Food', FoodSchema);
