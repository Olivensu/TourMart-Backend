const {Schema, model} = require("mongoose");

const FlightsSchema = new Schema({
    image:{
        type: String,
    }
}, {timestamps: true});

const Flights = model('Flights',FlightsSchema);

module.exports = Flights;