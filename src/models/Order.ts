import { Schema, model } from 'mongoose';
import { OrderStatus } from '../constants/order_status';
import { FoodType } from './Food';

export interface LatLng {
    lat: string;
    lng: string;
}

export interface OrderItem {
    food: FoodType;
    price: number;
    quantity: number;
}

export interface OrderType {
    items: OrderItem[];
    totalPrice: number;
    name: string;
    address: string;
    addressLatLng: LatLng;
    status: OrderStatus;
    user: Schema.Types.ObjectId;
}

const OrderSchema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        addressLatLng: {
            lat: { type: String, required: true },
            lng: { type: String, required: true }
        },
        totalPrice: { type: Number, required: true },
        items: [
            {
                food: { type: Schema.Types.ObjectId, required: true, ref: 'Food' },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true }
            }
        ],
        status: { type: String, default: OrderStatus.NEW },
        user: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    },
    {
        timestamps: true
    }
);

export default model('Order', OrderSchema);
