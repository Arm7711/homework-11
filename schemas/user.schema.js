import Joi from 'joi';

export default {
  registration: {
    body: Joi.object({
      username: Joi.string().min(3).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  },

  uploadProfilePicture: {
    body: Joi.object({
     profilePicture: Joi.string().required()
    }),
  },

}
