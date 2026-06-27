const {ChildOrder} = require("../../models/Order");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
    try {
        const {
            productId,
            userId,
            rating,
            userName,
            reviewMessage
        } = req.body;

        const order = await ChildOrder.findOne({ userId, "cartItems.productId": productId, paymentStatus: "completed" });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const existingReview = await ProductReview.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product." });
        }

        const newReview = new ProductReview({
            productId,
            userId,
            rating,
            userName,
            reviewMessage
        });

        await newReview.save();

        res.status(201).json({ success: true, message: "Review added successfully", data: newReview });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await ProductReview.find({ productId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = {
    addProductReview,
    getProductReviews
}