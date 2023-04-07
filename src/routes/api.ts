import { Router } from 'express';
import foodController from '../controllers/FoodControllers';
import userController from '../controllers/UserControllers';
import orderController from '../controllers/OrderControllers';
import middleware from '../middleware';

const apiRouter = Router();

apiRouter.use('/foods', middleware.apiLimiter, middleware.verifyToken, foodController.router);
apiRouter.use('/users', middleware.apiLimiter, userController.router);
apiRouter.use('/orders', middleware.apiLimiter, middleware.verifyToken, orderController.router);

export default apiRouter;
