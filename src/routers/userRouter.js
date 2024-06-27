const express = require('express');
const { getUsers, getUserById, deleteUserById, processRegister, activateUserAccount, updateUserById, banUserById, unbanUserById, handleUpdatePassword, handleForgetPassword, handleResetPassword, handleNewAddress } = require('../controllers/userController');
const upload = require('../middlewares/uploadFile');
const { validateUserRegistration } = require('../validators/auth');
const runValidation = require('../validators');
const { isloggedin, isloggedOut, isAdmin } = require('../middlewares/auths');
const userRouter = express.Router();



userRouter.post('/register',upload.single("image"), validateUserRegistration, runValidation,   processRegister);
userRouter.get('/',  getUsers); 
userRouter.get('/:email',  getUserById);
userRouter.put('/reset-password', handleResetPassword);
userRouter.put('/:id',upload.single("image"), updateUserById);
userRouter.delete('/:id',  deleteUserById);
userRouter.put('/ban-user/:id',  banUserById);
userRouter.put('/unban-user/:id',  unbanUserById);
userRouter.put('/update-password/:id', handleUpdatePassword);
userRouter.post('/forget-password', handleForgetPassword);
userRouter.post('/new-address', handleNewAddress);



module.exports = userRouter