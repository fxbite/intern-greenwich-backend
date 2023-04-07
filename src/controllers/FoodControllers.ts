import { Request, Response, Router } from 'express';
import { Food } from '../models';
import { sample_foods } from '../assets';
import middleware from '../middleware';

class FoodController {
    router = Router();

    constructor() {
        this.router;
        this.initRoutes();
    }

    private initRoutes() {
        this.router.get('/seed', this.addSampleFoods);
        this.router.get('/tags', this.countTagsByCategory);
        this.router.get('/:foodId', this.getFoodById);
        this.router.get('/tag/:tagName', this.getAllFoodByTag);
        this.router.get('/search/:searchTerm', this.searchFood);
        this.router.get('/', this.getAllFood);
    }

    // Add sample fooods
    private async addSampleFoods(req: Request, res: Response) {
        const foodsCount = await Food.countDocuments();
        if (foodsCount > 0) {
            middleware.returnData(res, 'Seed is already done!');
            return;
        }
        await Food.create(sample_foods);
        middleware.returnData(res, 'Seed Is Done!');
    }

    // Get All Food (with sample foods)
    private async getAllFood(req: Request, res: Response) {
        const foods = await Food.find();
        middleware.returnData(res, foods);
    }

    // Search like foods
    private async searchFood(req: Request, res: Response) {
        const searchRegex = new RegExp(req.params.searchTerm, 'i');
        const foods = await Food.find({ name: { $regex: searchRegex } });
        middleware.returnData(res, foods);
    }

    // Analyse tags by category
    private async countTagsByCategory(req: Request, res: Response) {
        const tags = await Food.aggregate([
            {
                $unwind: '$tags'
            },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: '$count'
                }
            }
        ]).sort({ count: -1 });

        const all = {
            name: 'All',
            count: await Food.countDocuments()
        };

        tags.unshift(all);
        middleware.returnData(res, tags);
    }

    private test(req: Request, res: Response) {
        res.send('OK');
    }

    // Get foods by a tag
    private async getAllFoodByTag(req: Request, res: Response) {
        const foods = await Food.find({ tags: { $in: [req.params.tagName] } });
        middleware.returnData(res, foods);
    }

    // Get a food by id
    private async getFoodById(req: Request, res: Response) {
        const food = await Food.findOne({ id: req.params.foodId });
        middleware.returnData(res, food);
    }
}

export default new FoodController();
