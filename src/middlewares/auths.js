const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const { accessKey } = require('../secret');

const isloggedin = async (req, res, next)=>{
    try {
        const token = req.cookies.accessToken;
        console.log(token);
        if(!token){
            throw createError(401, 'Access token not found')
        }

        const decoded = jwt.verify(token, accessKey)
        if(!decoded){
            throw createError(401, 'Invalid Access token')
        }
        req.user = decoded.user;
        next();
    } catch (error) {
        return next(error);
    }
}

const isloggedOut = async (req, res, next)=>{
    try {
        const accessToken = req.cookies.accessToken;
        console.log(accessToken);
        if(accessToken){
            throw createError(401, 'User is already logged in')
        }
        
        next();
    } catch (error) {
        return next(error);
    }
}

const isAdmin = async (req, res, next)=>{
    try {
        console.log(req.user.isAdmin);
        if(!req.user.isAdmin){
            throw createError(403, 'User is not a admin')
        }
        next();
    } catch (error) {
        return next(error);
    }
}

module.exports = {isloggedin,isloggedOut,isAdmin}