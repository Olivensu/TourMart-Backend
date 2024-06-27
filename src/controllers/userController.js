const createError = require('http-errors');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const User = require('../models/userModel');
const { successResponse } = require('./responceController');
const { findWithId } = require('../services/findUser');
const { deleteImage } = require('../helper/deleteImage');
const { activationKey, clientUrl, resetPasswordKey } = require('../secret');
const { createJsonWebToken } = require('../helper/jsonwebtoken');
const sendEmailWithNodeMailer = require('../helper/email');
const fs = require('fs').promises;


const getUsers = async(req, res, next) =>{
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const searchRegExp = new RegExp('.*' +search+ ".*", 'i');

        const filter = {
            isAdmin:{$ne:true},
            $or:[
                {name: {$regex:searchRegExp}},
                {email: {$regex:searchRegExp}},
                {phone: {$regex:searchRegExp}},
            ]
        }

        const options = {password: 0};

        const users = await User.find(filter,options).limit(limit).skip((page -1)*limit);

        const count = await User.find(filter).countDocuments();

        if(!users) throw createError(404, 'no users found');


    return successResponse(res, {
        statusCode: 200,
        message: 'users profile is return',
        payload: {
            users,
        pagination: {
            totalPages : Math.ceil(count/limit),
            currentPage: page,
            previousPage: page -1 > 0? page-1 : null,
            nextPage: page +1 <= Math.ceil(count/limit)? page+1 : null,
        }
        }
    })
    } catch (error) {
        next(error)
    }
}


const getUserById = async(req, res, next) =>{
    try {
        console.log(req.user);
        const email = req.params.email;
        console.log(email)
        // const options = {password:0};
        const user = await User.findOne({email:email});

        if(!user){
            throw createError(404, 'User not found');
        }

    return successResponse(res, {
        statusCode: 200,
        message: 'user profile is return',
        payload: {user}
    })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const processRegister = async(req, res, next) =>{
    try {
        const {name, email, password, phone, address} = req.body;
        if(!req.file){
            throw createError(404, 'Image not found')
        }
        const imagefile = req.file;

        if(!imagefile){
            throw createError(404, 'Image not found')
        }
        if(imagefile.size>1024*1024*2){
            throw createError(400, 'Image size is too large')
        }
        const image = req.file.filename;

        const userExists = await User.exists({email:email})

        if(userExists){
            throw createError(409, 'User already exists, please sign in')
        }

        const user = await User.create({name,email,password,phone,address,image});
        user.newAddress.push({name: name, address:address, phone:phone})
        user.save()

        // const token = createJsonWebToken({name, email, password, phone, address, image}, activationKey, '10m')

        // console.log(token);

        // // prepare email
        // const emailData = {
        //     email,
        //     subject: 'Account Activation Email',
        //     html: `
        //     <h2>Hello ${name} !</h2>
        //     <p>Please Click Here to : <a href="${clientUrl}/api/users/activate/${token}" target ="_blank">Activate your account</a></p>
        //     `
        // }

        // // send email with nodeemailer
        // try {
        //     await sendEmailWithNodeMailer(emailData)
        // } catch (error) {
        //     next(createError(500, 'Failed to send varification email'))
        //     return;
        // }


    return successResponse(res, {
        statusCode: 200,
        message: `Please go to your ${email} for completing your registration process`,
        payload: {user}
    })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const activateUserAccount = async(req, res, next) =>{
    try {
    const token = req.body.token;

    if(!token) throw createError(404, 'token not found')

    try {
        const decoded = jwt.verify(token, activationKey);

        if(!decoded) throw createError(401, 'user not verified')

        const userExists = await User.exists({email:decoded.email})

        if(userExists){
            throw createError(409, 'User already exists, please sign in')
        }

        await User.create(decoded);

        return successResponse(res, {
            statusCode: 201,
            message: `User was registered successfully`,
            payload: {decoded},
        })
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            throw createError(401, 'Token has expired');
        }else if(error.name === 'JsonWebTokenError'){
            throw createError(401, 'invalid Token');
        }else{
            throw error;
        }
    }
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const updateUserById = async(req, res, next) =>{
    try {
        const id = req.params.id;
        const options = {new: true, runValidators:true, context: 'query'};
        const optionsFind = {password:0};
        await findWithId(User, id,optionsFind)
        let update = {};
        if(req.body.name){
            update.name = req.body.name;
        }
        if(req.body.password){
            update.password = req.body.password;
        }
        if(req.body.address){
            update.address = req.body.address;
        }
        if(req.body.phone){
            update.phone = req.body.phone;
        }

        const imagefile = req.file;

        if(imagefile){
            if(!imagefile){
                throw createError(404, 'Image not found')
            }
            if(imagefile.size>1024*1024*2){
                throw createError(400, 'Image size is too large')
            }
            update.image = req.file.filename;
        }

        // delete update.email;
        const updateUser = await User.findByIdAndUpdate(id, update,options).select("-password")
        if(!updateUser){
            throw createError(404, 'User with this id does not exist')
        }

        
        return successResponse(res, {
            statusCode: 200,
            message: 'user was updated successfully',
            payload: updateUser,
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const banUserById = async(req, res, next) =>{
    try {
        const id = req.params.id;
        const options = {new: true, runValidators:true, context: 'query'};
        await findWithId(User, id)

        const update = {isBanned: true}

        // delete update.email;
        const updateUser = await User.findByIdAndUpdate(id, update,options).select("-password")
        if(!updateUser){
            throw createError(400, 'User was not banned successfully')
        }

        
        return successResponse(res, {
            statusCode: 200,
            message: 'user was updated successfully',
            payload: updateUser,
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const unbanUserById = async(req, res, next) =>{
    try {
        const id = req.params.id;
        const options = {new: true, runValidators:true, context: 'query'};
        await findWithId(User, id)

        const update = {isBanned: false}

        // delete update.email;
        const updateUser = await User.findByIdAndUpdate(id, update,options).select("-password")
        if(!updateUser){
            throw createError(400, 'User was banned')
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'user was unbanned successfully',
            payload: updateUser,
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const handleUpdatePassword = async(req, res, next) =>{
    try {
        const {email, oldPassword, newPassword, confirmPassword} = req.body;
        const userId = req.params.id;
        
        // const id = req.params.id;
        
        const user = await findWithId(User, userId)

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if(!isPasswordMatch){
            throw createError(400, 'User  oldPasswords do not match')
        }

        const filter = {userId}
        const update = {$set: {password: newPassword}}
        const options = {new: true, runValidators:true, context: 'query'};

        // // delete update.email;
        const updateUser = await User.findByIdAndUpdate(userId, {password: newPassword},{new: true}).select("-password")
        if(!updateUser){
            throw createError(400, 'User was banned')
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'user password was updated successfully',
            payload: {updateUser},
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const handleForgetPassword = async(req, res, next) =>{
    try {
        const {email} = req.body;
        
        const user = await User.findOne({email})

        if(!user){
            throw createError(404, 'User  not found')
        }

        const token = createJsonWebToken({ email:email}, resetPasswordKey, '10m')

        console.log(token);

        // prepare email
        const emailData = {
            email,
            subject: 'Reset Password Email',
            html: `
            <h2>Hello ${user.name} !</h2>
            <p>Please Click Here to : <a href="${clientUrl}/api/users/reset-password/${token}" target ="_blank">Reset your password</a></p>
            `
        }

        // send email with nodeemailer
        try {
            await sendEmailWithNodeMailer(emailData)
        } catch (error) {
            next(createError(500, 'Failed to send reset password email'))
            return;
        }


    return successResponse(res, {
        statusCode: 200,
        message: `Please go to your ${email} for resetting your password`,
        payload: {token}
    })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

const handleNewAddress = async(req, res, next) =>{
    try {
        const {name, phone, address,email} = req.body;
        
        const user = await User.findOne({email})

        if(!user){
            throw createError(404, 'User  not found')
        }
        user.newAddress.push({name: name,phone:phone,address:address})
        await user.save();

    return successResponse(res, {
        statusCode: 200,
        message: `New address created successfully`,
        payload: user.newAddress
    })
    } catch (error) {
        next(error)
    }
}

const handleResetPassword = async(req, res, next) =>{
    try {
        const {token, password} = req.body;
        
        const decoded = jwt.verify(token,resetPasswordKey)
        console.log(decoded)
        if(!decoded){
            throw createError(400, 'Invalid or expired token')
        }

        const filter = {email:decoded.email};
        const update = {password:password };

        const updateUser = await User.findOneAndUpdate(filter, update,{new: true}).select("-password")
        if(!updateUser){
            throw createError(400, 'Password reset failed')
        }

        return successResponse(res, {
            statusCode: 200,
            message: 'user password was reset successfully',
            payload: {updateUser},
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}


const deleteUserById = async(req, res, next) =>{
    try {
        const id = req.params.id;
        const options = {password:0};
        const user = await findWithId(User, id,options)

        if(!user){
            throw createError(404, 'User not found');
        }

        const userImagePath = user.image
        
        deleteImage(userImagePath)

      await User.findByIdAndDelete({_id:id, isAdmin: false})

    return successResponse(res, {
        statusCode: 200,
        message: 'user was deleted successfully',
    })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
}

module.exports = {getUsers, getUserById, deleteUserById,handleUpdatePassword,handleResetPassword,handleForgetPassword,updateUserById,banUserById,unbanUserById, processRegister, activateUserAccount,handleNewAddress}