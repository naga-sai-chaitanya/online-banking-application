require('dotenv').config({path:'./config.env'})

const mongo_uri = process.env.MONGO_URI;

const mongoose = require('mongoose')


const conn = mongoose.connect(mongo_uri)
                                       .then(data => console.log('Connected to MongoDB...'))
                                       .catch(err => console.log('Error in connecting to DB.'))



const {Schema} = mongoose

const customerModel = new Schema ({
    name: String,
    email:{type:String,unique:true},
    password:String,
    accountNumber : Number,
    balance:Number
    
})

const Customer = mongoose.model('Customer',customerModel)

module.exports  = Customer;
