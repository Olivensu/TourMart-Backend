const {body} = require("express-validator")
// registration validation
const validateUserRegistration = [
    body('name').trim().notEmpty().withMessage("Name is required").isLength({min: 3, max: 31}).withMessage('Name should be between 3 and 31 characters'),
    body('email').trim().notEmpty().withMessage("email is required").isEmail().withMessage('Invalid Email'),
    body('password').trim().notEmpty().withMessage("password is required").isLength({min: 6}).withMessage('password should be min 6 characters'),
    body('address').trim().notEmpty().withMessage("address is required"),
    body('phone').trim().notEmpty().withMessage("phone is required"),
    body('image').optional().isString().withMessage("image is required"),
];
// login validation
const validateUserLogin = [
    body('email').trim().notEmpty().withMessage("email is required").isEmail().withMessage('Invalid Email'),
    body('password').trim().notEmpty().withMessage("password is required").isLength({min: 6}).withMessage('password should be min 6 characters'),
];

// sign in validation

module.exports = {validateUserRegistration, validateUserLogin};