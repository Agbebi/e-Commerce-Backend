
const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: String,
    cartId: String,
    cartItems: [
        {
            productId : String,
            title : String,
            image : String,
            price : String,
            quantity : String
        }
    ],
    addressInfo : {
        addressId : String,
        address : String,
        city : String,
        postalCode : String,
        phoneNumber : String,
        notes : String,
        country : String,
        state : String,
    },
    orderStatus : String,
    paymentMethod : String,
    paymentStatus : String,
    totalAmount : Number,
    orderDate : Date,
    orderUpdateDate : Date,
    paymentId : String,
    payerId : String
})


module.exports = mongoose.model('Order', OrderSchema)