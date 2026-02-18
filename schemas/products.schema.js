import Joi from "joi";


export default {

  createProduct: {
    body: Joi.object({
      name: Joi.string().min(3).required(),
      description: Joi.string().optional(),
      price: Joi.number().min(0).required(),
      category: Joi.string().optional(),
      isAvailable: Joi.boolean().optional()
    }),

    params: Joi.object({
      restaurantId: Joi.number()
        .integer()
        .positive()
        .required()
    })
  },


  getProductsByRestaurant: {
    params: Joi.object({
      restaurantId: Joi.number()
        .integer()
        .positive()
        .required()
    })
  },


  getProductById: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required(),

      restaurantId: Joi.number()
        .integer()
        .positive()
        .required(),
    })
  },


  updateProduct: {
    body: Joi.object({
      name: Joi.string().min(3).optional(),
      description: Joi.string().optional(),
      price: Joi.number().min(0).optional(),
      category: Joi.string().optional(),
      isAvailable: Joi.boolean().optional()
    }),

    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required(),

      restaurantId: Joi.number()
        .integer()
        .positive()
        .required(),
    })
  },

  deleteProduct: {
    params: Joi.object({
      id: Joi.number()
        .integer()
        .positive()
        .required(),

      restaurantId: Joi.number()
        .integer()
        .positive()
        .required(),
    })
  },
}







