const Product = require('../../models/Product');
const {ParentOrder, ChildOrder} = require('../../models/Order');
const User = require('../../models/User');

const deliverOrder = async (req, res) => {
    const { orderId } = req.params

    try {

        const order = await ParentOrder.findByIdAndUpdate(orderId, { deliveryStatus: 'delivered' }, { new: true });
        
        return res.status(200).json({
            success : true,
            data : order
        })
        

    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
}

const fetchAllOrders = async (req, res) => {

    const { userId } = req.params

    try {
        const orders = await ParentOrder.find({});
        
      return  res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const fetchOrderDetails = async (req, res) => {

    const { userId } = req.params
    const { childOrders } = req.body

    try {
        
        const orders = await ChildOrder.find({ _id: { $in: childOrders } })
                
      return  res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const updateOrderStatus = async (req, res) => {

    const { updatedStatus } = req.body
    const { orderId } = req.params

    try {
        const order = await ParentOrder.findByIdAndUpdate(orderId, { deliveryStatus: updatedStatus}, { new: true });

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = { deliverOrder, fetchAllOrders, updateOrderStatus, fetchOrderDetails }