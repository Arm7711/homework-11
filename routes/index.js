import {Router} from 'express';

import restaurant from "./restaurant.js";
import products from "./product.js";
import users from "./users.js";


const router = Router();

router.use('/users', users);
router.use('/restaurant', restaurant);
router.use('/restaurants/:restaurantId/products', products);


export default router;
