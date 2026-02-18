import { Router } from 'express';
import controller from '../controllers/users.js';
import upload from "../middlewares/upload.js";
import authorize from "../middlewares/authMiddlewere.js";
import validation from '../middlewares/validation.js';
import schema from '../schemas/user.schema.js';

const router = Router();
const uploadUser = upload('users');

router.post('/register', uploadUser.single('profilePicture'), validation(schema.registration), controller.registration);
router.post('/login', validation(schema.login), controller.login);
router.get('/profile', authorize, controller.profile);

router.post(
  '/profile-picture',
  authorize,
  uploadUser.single('profilePicture'),
  controller.uploadProfilePicture
);

export default router;
