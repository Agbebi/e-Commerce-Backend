const Order = require("../../models/order");
const ProductReview = require("../../models/Review");
const Product = require("../../models/product");

const addProductReview = async (req, res) => {
   
    
    try {

        const {
            productId,
            userId,
            rating,
            userName,
            reviewMessage
        } = req.body;


        const order = await Order.findOne({ userId, "cartItems.productId": productId, orderStatus: "delivered" });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const newReview = new ProductReview({
            productId,
            userId,
            rating,
            userName,
            reviewMessage
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const getProductReviews = async (req, res) => {

        try {
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } 
}


module.exports = {
    addProductReview,
    getProductReviews
}