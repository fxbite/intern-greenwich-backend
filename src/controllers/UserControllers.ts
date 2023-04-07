import { Request, Response, Router } from 'express';
import { User } from '../models';
import { UserType } from '../models/User';
import { sample_users } from '../assets';
import middleware from '../middleware';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

class UserController {
    router = Router();

    constructor() {
        this.router;
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get('/seed', this.addSampleUsers);
        this.router.post('/login', middleware.validationAPI('loginSchema'), this.login);
        this.router.post('/register', middleware.validationAPI('registerSchema'), this.register);
    }

    // Add sample users
    private async addSampleUsers(req: Request, res: Response) {
        const usersCount = await User.countDocuments();
        if (usersCount > 0) {
            middleware.returnData(res, 'Seed is already done!');
            return;
        }
        await User.create(sample_users);
        middleware.returnData(res, 'Seed Is Done!');
    }

    // Login function
    private login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            middleware.returnData(res, this.generateToken(user));
        } else {
            res.status(HTTP_BAD_REQUEST).send('Username or password is invalid!');
        }
    };

    // Register function
    private register = async (req: Request, res: Response) => {
        const { name, email, password, address } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.status(HTTP_BAD_REQUEST).send('User is already exist, please login!');
            return;
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser: UserType = {
            name: name as string,
            email: email.toLowerCase(),
            password: encryptedPassword,
            address,
            isAdmin: false
        };
        await User.create(newUser);
        middleware.returnData(res, 'Register Successfully');
    };

    // Generate jwt
    private generateToken(user: UserType) {
        const token = sign({ email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET!, { expiresIn: '35d' });

        return {
            email: user.email,
            name: user.name,
            address: user.address,
            isAdmin: user.isAdmin,
            access_token: token,
            expire: '35d'
        };
    }
}

export default new UserController();
