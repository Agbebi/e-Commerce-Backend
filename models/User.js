const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpiresAt: Date,
    role: {
        type: String,
        default: 'user'
    },
    phoneNumber: {
        type: String,
        required: true,
    }
})

const vendorSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    shopName: {
        type: String,
        required: true,
    },
    shopDescription: String,
    shopAddress: String,
    // gstNumber: String,
    // panNumber: String,
    phoneNumber: {
        type: String,
        required: true,
    },
    bankDetails: {
        accountNumber: String,
        bankName: String,
        accountHolderName: String
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'vendor'
    }
})

const dispatchAgentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    vehicleDetails: {
        vehicleType: String,
        vehicleNumber: String
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'dispatch'
    }
})

const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const DispatchAgent = mongoose.model('DispatchAgent', dispatchAgentSchema);
module.exports = { User, Vendor, DispatchAgent }