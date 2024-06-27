const express = require('express');
const {mongoose} = require('mongoose');
const createHttpError = require('http-errors');
const upload = require('../middlewares/uploadFile');
const Slider = require('../models/sliderModel');
const { successResponse } = require('../controllers/responceController');
const { deleteImage } = require('../helper/deleteImage');
const { findWithId } = require('../services/findUser');
const Campaign = require('../models/campaignModel');
const FlashSale = require('../models/flashsaleModel');
const flightRouter = express.Router();


flightRouter.get('/flights', isloggedin, async(req, res,next) => {

    try {
        const flights = await Flights.find()
        if(!flights) throw createHttpError(404, 'no users found');

        return successResponse(res, {
            statusCode: 200,
            message: `flights Found`,
            payload: flights
        })
    } catch (error) {
        if(error instanceof mongoose.Error){
            next(createHttpError(400, 'Invalid User Id'))
            return;
        }
        next(error)
    }
})



module.exports = flightRouter;

