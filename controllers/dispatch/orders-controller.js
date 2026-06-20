const Product = require('../../models/Product');
const { ParentOrder, ChildOrder } = require('../../models/Order');
const { User, Vendor } = require('../../models/User');
const axios = require('axios');

const getOTP = async (req, res) => {
    const { orderId } = req.params

    try {



        const order = await ParentOrder.findById(orderId);

        const userMobile = order.userInfo.userMobile;

        const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number

        const data = {
            messaging_product: 'whatsapp',
            to: "2347042775318", // Replace with the recipient's phone number
            type: 'text',
            text: {
                body: `Your one-time passcode is ${randomDigits}. Only share with your delivery agent after you have verified your order.`
            }
        };

        accessToken = 'EAAODhnypZCwsBRj7GoZAxxF2pj00GwcP60S4CzsfU5I2cnAauZBWa71vMNHAGiSG0UKR0xcivKU74hUBEO9WxwjZCixKPRMOshIt9GJpQ8m2DtlnUwZAU8SBaU8I92OQjakgaZCZCJRXivOqcBBWwYEtaeFDg1BF9cXgIAb13lZBx764NHusE7BA2dT3i9ydc4KqmgZDZD'

        axios.post('https://graph.facebook.com/v21.0/1140591912470830/messages', data, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => console.log(response.data, 'Message sent successfully'))
            .catch(error => console.error(error.response.data));


        return res.status(200).json({
            success: true,
            data: randomDigits
        })
    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getFilteredOrders = async (req, res) => {
    try {
        const { status, sortBy } = req.query

        const filter = {}
        if (status && status !== 'all') {
            filter.deliveryStatus = status
        }

        const sortCriteria = { orderDate: -1 }
        if (sortBy === 'oldest') {
            sortCriteria.orderDate = 1
        }

        const response = await ParentOrder.find(filter).sort(sortCriteria)

        res.status(200).json({
            success: true,
            data: response
        })
    } catch (error) {
        console.log('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching orders!'
        });
    }
}

const setDeliver = async (req, res) => {
    const { orderId } = req.params
    try {
        const order = await ParentOrder.findByIdAndUpdate(orderId, { deliveryStatus: 'delivered' }, { new: true })

        res.status(200).json({
            success: true,
            message: "Order updated successfully!"
        })
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: 'There was an error!'
        })

    }
}

const fetchAllOrders = async (req, res) => {

    const { userId } = req.params

    try {
        const orders = await ParentOrder.find({}).sort({ orderDate: -1 });

        return res.status(200).json({
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

        let orders = await ChildOrder.find({ _id: { $in: childOrders } }).populate('vendorId')

        return res.status(200).json({
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
        const order = await ParentOrder.findByIdAndUpdate(orderId, { deliveryStatus: updatedStatus }, { new: true });

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

const fetchVendorDetails = async (req, res) => {

    const { userIds } = req.body
    try {

        const user = await User.find({ _id: { $in: userIds } })

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = { getOTP, fetchAllOrders, updateOrderStatus, fetchOrderDetails, setDeliver, fetchVendorDetails, getFilteredOrders }