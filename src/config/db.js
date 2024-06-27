const mongoose = require('mongoose');
const { mongoDBURL } = require('../secret');

const connectDB = async(options = {}) =>{
    try {
        await mongoose.connect(mongoDBURL, options)
        console.log('Connection to DB is established');

        mongoose.connection.on('error', err => {
            console.error('DB connection error', err);
        })
    } catch (error) {
        console.error('could not connect to DB',    error.toString());
    }
}

module.exports = connectDB