import Restaurant from './Restaurant.js';
import Product from './Products.js';
import { associateRestaurant } from "./Restaurant.js";
import { associateProduct } from "./Products.js";

associateRestaurant({ Restaurant, Product });
associateProduct({ Restaurant, Product });


export {default as Restaurant} from "./Restaurant.js";
export {default as Products} from "./Products.js";
export {default as User} from "./User.js";

