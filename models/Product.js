const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    images : [String],
    vendorId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    name : String,
    description : String,
    category : String,
    price : Number,
    brand : String,
    salesPrice : Number,
    totalStock : Number,
}, {timestamps : true})


module.exports = mongoose.model('Product', productSchema)