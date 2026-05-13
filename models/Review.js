const mongoose = require('mongoose');

const ProductReviewSchema = new mongoose.Schema({
    productId: String,
    userId: String,
    rating: Number,
    userName: String,
    reviewMessage: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true});


module.exports = mongoose.model('ProductReview', ProductReviewSchema);