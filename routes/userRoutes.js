import Express from 'express';
import {
  getAllUsers,
  getUser,
  updateUserAdmin,
  deleteUser,
  updateLoggedUser,
  deactivateUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/userController.js';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/authController.js';

export const router = Express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect); //From this point all of the routes require authentication

router.get('/me', getMe, getUser);
router.patch('/update-my-password', updatePassword);
router.patch(
  '/update-my-profile',
  uploadUserPhoto,
  resizeUserPhoto,
  updateLoggedUser
);
router.delete('/deactivate-my-account', deactivateUser);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);

router.route('/:id').get(getUser).patch(updateUserAdmin).delete(deleteUser);

export { router as userRouter };
