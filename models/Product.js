const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    image : String,
    name : String,
    description : String,
    category : String,
    price : Number,
    brand : String,
    salesPrice : Number,
    totalStock : Number,
}, {timestamps : true})


module.exports = mongoose.model('Product', productSchema)