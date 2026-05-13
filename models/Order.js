
const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: String,
    userInfo: {
        userEmail: String,
        userId: String,
        userMobile: String,
        userName: String
    },
    cartId: String,
    cartItems: [
        {
            productId : String,
            name : String,
            imageUrl : String,
            price : Number,
            description : String,
            quantity : Number,
            vendorId : String
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
    payerId : String,
    deliveryStatus : String
})


module.exports = mongoose.model('Order', OrderSchema)