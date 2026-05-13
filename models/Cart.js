const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type : Number,
                required: true,
                min: 1
            },
            description : String,
            name : String,
            imageUrl : String,
            price : Number,
            vendorId : String
        }
    ]
}, {
    timestamps : true
})


module.exports = mongoose.model('Cart', CartSchema)