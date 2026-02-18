import {Router} from 'express';
import * as productController from '../controllers/products.js';
import validation from "../middlewares/validation.js";
import schema from "../schemas/products.schema.js";
import authorize from "../middlewares/authMiddlewere.js";
import upload from "../middlewares/upload.js";

const router = Router({mergeParams: true});
const uploadProduct = upload('product');

router.get('/', authorize, validation(schema.getProductsByRestaurant), productController.getProductsByRestaurant);
router.get('/:id', authorize, validation(schema.getProductById), productController.getProductById);

router.post('/', authorize, uploadProduct.array('images', 5), validation(schema.createProduct), productController.createProduct );
router.put('/:id', authorize, uploadProduct.array('images', 5), validation(schema.updateProduct), productController.updateProduct);
router.delete( '/:id', authorize, validation(schema.deleteProduct), productController.deleteProduct);

export default router;
