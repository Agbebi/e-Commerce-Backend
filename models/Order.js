const mongoose = require('mongoose')

const ChildOrderSchema = new mongoose.Schema({
    parentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParentOrder',
        
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        
    },
    cartItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            name: String,
            imageUrl: String,
            price: Number,
            description: String,
            quantity: Number,
        }
    ],
    subTotal: Number,
    shippingStatus: {
        type: String,
        enum: ['pending', 'accepted', 'packaging', 'ready', 'cancelled'],
        default: 'pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    orderUpdateDate: Date,
    payoutStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    payoutDate: Date
})

const ParentOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cartId: String,
    paymentId: String,
    userInfo: {
        userEmail: String,
        userId: String,
        userMobile: String,
        userName: String
    },
    addressInfo: {
        addressId: String,
        address: String,
        city: String,
        postalCode: String,
        phoneNumber: String,
        notes: String,
        country: String,
        state: String,
    },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalAmount: Number,
    orderDate: {
        type: Date,
        default: Date.now
    },
    childOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChildOrder'
    }]
})

const ParentOrder = mongoose.model('ParentOrder', ParentOrderSchema)
const ChildOrder = mongoose.model('ChildOrder', ChildOrderSchema)

module.exports = { ParentOrder, ChildOrder }
