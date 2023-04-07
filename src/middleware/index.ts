import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { HTTP_FORBIDDEN, HTTP_BAD_REQUEST, HTTP_UNAUTHORIZED, HTTP_INTERNAL_SERVER_ERROR, HTTTP_OK } from '../constants/http_status';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import Joi from 'joi';

interface UserAuth {
    email: string;
    isAdmin: boolean;
}

export interface AuthRequest extends Request {
    user?: UserAuth;
}

interface CustomErrorRequestHandler extends ErrorRequestHandler {
    stack?: string;
}

interface LoginSchema {
    email: string;
    password: string;
}

interface RegisterSchema {
    name: string;
    email: string;
    password: string;
    address: string;
}

class Middleware {
    private loginSchema = Joi.object<LoginSchema>({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    private registerSchema = Joi.object<RegisterSchema>({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        address: Joi.string().required()
    });

    public apiLimiter: RateLimitRequestHandler = rateLimit({
        windowMs: 1000, // 1s
        max: 2, // Limit each IP to requests per `window` (here, per 1s)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests. Try again later'
    });

    public async verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) return res.status(HTTP_UNAUTHORIZED).json({ error: 'Missing token' });
            const decoded = await verify(token, process.env.JWT_SECRET!);
            req.user = decoded as UserAuth;
            next();
        } catch (error) {
            res.status(HTTP_FORBIDDEN).json({ error: 'Invalid token' });
        }
    }

    public errorHandler: CustomErrorRequestHandler = (err, req, res, next) => {
        console.error(err.stack);
        res.status(HTTP_INTERNAL_SERVER_ERROR).send('Internal Server Error');
    };

    public returnData(res: Response, data: any) {
        res.status(HTTTP_OK).json(data);
    }

    public validationAPI = (option: 'loginSchema' | 'registerSchema') => (req: Request, res: Response, next: NextFunction) => {
        if (option === 'loginSchema') {
            const { error, value } = this.loginSchema.validate(req.body);
            if (error) {
                // Handle validation error
                return res.status(HTTP_BAD_REQUEST).json({ error: error.details[0].message });
            }
            return next();
        }

        const { error, value } = this.registerSchema.validate(req.body);
        if (error) {
            // Handle validation error
            return res.status(HTTP_BAD_REQUEST).json({ error: error.details[0].message });
        }
        return next();
    };
}

export default new Middleware();
