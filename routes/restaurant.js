import { Router } from 'express';
import validation from '../middlewares/validation.js';
import schema from '../schemas/restaurant.schema.js';
import * as ControllerRestaurant from '../controllers/restaurant.js';
import productRoutes from "./product.js"
import upload from "../middlewares/upload.js";

const router = Router();

router.use('/:restaurantId/products', productRoutes);
const uploadRestaurant = upload('Restaurant');


router.post(
  '/',
  uploadRestaurant.single('coverImage'),
  validation(schema.createRestaurant),
  ControllerRestaurant.createRestaurant
);

router.get(
  '/',
  ControllerRestaurant.getAllRestaurants
);

router.get(
  '/nearby',
  ControllerRestaurant.findNearbyRestaurants
);

router.get(
  '/:id',
  validation(schema.getRestaurantById),
  ControllerRestaurant.getRestaurantById
);

router.put(
  '/:id',
  uploadRestaurant.single('coverImage'),
  validation(schema.updateRestaurant),
  ControllerRestaurant.updateRestaurant
);

router.delete('/:id',
  validation(schema.getRestaurantById),
  ControllerRestaurant.deleteRestaurant);

export default router;
