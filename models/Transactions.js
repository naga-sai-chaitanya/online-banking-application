require('dotenv').config({path:'../config.env'})

const mongo_uri = process.env.MONGO_URI;

const mongoose = require('mongoose')


const conn = mongoose.connect(mongo_uri)
                                       .then(data => console.log('Connected to MongoDB...'))
                                       .catch(err => console.log('Error in connecting to DB.'))



const {Schema} = mongoose


const transactionSchema = new Schema({
    
    userId:String,
    date:String,
    accountNo:Number,
    name:String,
    Received:Number,
    Sent:Number


})

const Transactions = mongoose.model('Transactions',transactionSchema);

module.exports = Transactions;