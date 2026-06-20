const Product = require('../../models/Product');
const { ParentOrder, ChildOrder } = require('../../models/Order');
const { DispatchAgent } = require('../../models/User');
const User = require('../../models/User');
const axios = require('axios');

const deliverOrder = async (req, res) => {
    const { orderId } = req.params
    const { userId } = req.body

    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        } else {
            const isAdmin = user.roles.includes('admin');
            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access"
                })
            }
        }

        const order = await Order.findByIdAndUpdate(orderId, { deliveryStatus: 'delivered', orderStatus: 'delivered' }, { new: true });

        return res.status(200).json({
            success: true,
            data: order
        })


    } catch (error) {
        console.error("Error delivering order:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const fetchAllOrders = async (req, res) => {
    const { userId } = req.params
    const { status, sortBy } = req.query

    try {
        const filter = { vendorId: userId }
        const allowedDeliveryStatuses = ['pending', 'accepted', 'packaging', 'ready', 'cancelled', 'processing', 'shipped', 'delivered']

        if (status && status !== 'all' && allowedDeliveryStatuses.includes(status)) {
            filter.deliveryStatus = status
        }

        const sortCriteria = { _id: -1 }
        if (sortBy === 'oldest') {
            sortCriteria._id = 1
        }

        const orders = await ChildOrder.find(filter).sort(sortCriteria)

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
        const order = await ChildOrder.findByIdAndUpdate(orderId, { deliveryStatus: updatedStatus }, { new: true });

        console.log(updatedStatus, 'Updated Status');
        

        if (updatedStatus === 'ready') {
            // vendorId = order.vendorId

            // const dispatchMobile = await DispatchAgent.findById(vendorId).select('phoneNumber');

            // const recipientPhone = dispatchMobile.phoneNumber ? dispatchMobile.phoneNumber.slice(1) : '';
            const data = {
                messaging_product: 'whatsapp',
                to: "2347042775318", // Replace with the recipient's phone number
                type: 'template',
                template: {
                    name: 'order_waiting', // Replace with your actual template name
                        language: {
                            code: 'en'
                        },
                }
            };

            accessToken = 'EAAODhnypZCwsBRjmhHPUSeMgnW3oqpBDjgmMebVZC3Rb6vOGgZBEOXIdK2IZCpO9RPzSgkUt2uZB9FyxptTTGyEC7wWT7DNYOrxPAQggX9O8suRjeoUSXTZBcq3t6FfFZCzzcyOi2m0HMaAYjYDi7KnViJ42zZCmzh0lhQ3neR69xpes3tdo7OfuisYtziR34INOEQZDZD'

            axios.post('https://graph.facebook.com/v21.0/1140591912470830/messages', data, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => console.log(response.data, 'Message sent successfully'))

        }

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