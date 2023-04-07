import { Request, Response, Application } from 'express';
import apiRouter from './api';
import { HTTP_NOT_FOUND } from '../constants/http_status';

const route = (app: Application) => {
    app.use('/api', apiRouter);

    app.use('*', (req: Request, res: Response) => {
        res.status(HTTP_NOT_FOUND).json('No service found');
    });
};

export default route;
