const Product = require('../../models/Product');
const Order = require('../../models/Order');
const User = require('../../models/User');

const deliverOrder = async (req, res) => {
    const { orderId, userId } = req.params


    console.log(orderId, 'Order Id');
    

    try {

        const user = await User.findById(userId);

        console.log(user.role, 'User Role');
        
        if (!user) {
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }else {
            const isAdmin = user.roles.includes('admin');
            if (!isAdmin) {
                return res.status(403).json({
                    success : false,
                    message : "Unauthorized access"
                })
            }
        }

        const order = await Order.findByIdAndUpdate(orderId, { deliveryStatus: 'delivered', orderStatus: 'delivered' }, { new: true });
        
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
        const orders = await Order.find({ "cartItems.vendorId": userId });
        
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
        const order = await Order.findByIdAndUpdate(orderId, { deliveryStatus: updatedStatus, orderStatus: updatedStatus }, { new: true });

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

module.exports = { deliverOrder, fetchAllOrders, updateOrderStatus }