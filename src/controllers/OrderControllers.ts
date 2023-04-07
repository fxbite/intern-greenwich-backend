import { Request, Response, Router } from 'express';
import { Order } from '../models';
import { OrderType } from '../models/Order';
import { OrderStatus } from '../constants/order_status';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import middleware, { AuthRequest } from '../middleware';

class OrderController {
    router = Router();

    constructor() {
        this.router;
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/create', this.createOrder);
        this.router.get('/track/:id', this.trackOrderByUser);
        this.router.get('/history/:id', this.getOrderHistoryByUser);
    }

    // Check if object has properties of Order
    private isOrder(object: unknown): object is OrderType {
        if (object !== null && typeof object === 'object') {
            return 'name' in object && 'address' in object && 'totalPrice' in object && 'addressLatLng' in object && 'items' in object;
        }
        return false;
    }

    // Create new order
    private async createOrder(req: AuthRequest, res: Response) {
        const requestOrder = req.body;

        if (requestOrder.items.length <= 0 || !this.isOrder) {
            return res.status(HTTP_BAD_REQUEST).send('Cart Is Empty!');
        }
        await Order.deleteOne({
            user: req.user?.email,
            status: OrderStatus.NEW
        });

        const newOrder = new Order({ ...requestOrder, user: req.user?.email });
        await newOrder.save();
        middleware.returnData(res, newOrder);
    }

    // Track order by user
    private async trackOrderByUser(req: Request, res: Response) {
        const order = await Order.findOne({ user: req.params.id, status: OrderStatus.NEW });
        middleware.returnData(res, order);
    }

    // Get order history by user
    private async getOrderHistoryByUser(req: Request, res: Response) {
        const order = await Order.find({ user: req.params.id, status: OrderStatus.CONFIRMED });
        middleware.returnData(res, order);
    }
}

export default new OrderController();
