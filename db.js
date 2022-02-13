const mongoose = require('mongoose');
const dotenv=require("dotenv");
dotenv.config();

function connectToMongo() {
    mongoose.connect(process.env.CONNECTION_URL || "0.0.0.0", function () {
        console.log("Connected");
    })
}

module.exports = connectToMongo;