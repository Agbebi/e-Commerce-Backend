const ordersController = require("../../helpers/paypal");
const Order = require('../../models/Order')
const Cart = require('../../models/Cart')


const createOrder = async (req, res) => {
    try {
        const { userId, cartId, cartItems, addressInfo, orderStatus, paymentMethod, paymentStatus, totalAmount, orderDate, orderUpdateDate, paymentId, payerId } = req.body;

        let order = await Order.findOne({ cartId })

        if (!order) {

            const order = new Order({
                userId: userId,
                cartId: cartId,
                cartItems: cartItems,
                addressInfo: addressInfo,
                orderStatus: orderStatus,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                totalAmount: totalAmount,
                orderDate: orderDate,
                orderUpdateDate: orderUpdateDate,
                paymentId: paymentId,
                payerId: payerId
            })

            order.save()

        }



        const collect = {
            body: {
                intent: 'CAPTURE',
                applicationContext: {
                    returnUrl: 'https://timscommerce.netlify.app/shop/payment',
                    cancelUrl: 'https://timscommerce.netlify.app/shop/checkout'
                },
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: 'USD',
                            value: order.totalAmount.toString()
                        }
                    }
                ]
            }
        }


        const response = await ordersController.createOrder(collect)

        res.status(200).json(response)

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'There was an error creating Order!'
        })
    }
}


const capturePayment = async (req, res) => {
    try {
        const { orderID } = req.params
        const { userID } = req.body        
        
      
        const collect = {
            id: orderID
        }

        const result = await ordersController.captureOrder(collect)

        //Update Database

        const payerId = result.result.payer.payerId
        const paymentId = result.result.id
        
        const order = await Order.findByIdAndUpdate(orderID,{
            paymentId : paymentId,
            payerId : payerId,
            paymentStatus : 'Paid',
            orderStatus : 'confirmed',
            orderUpdateDate : new Date()
        }, { new : true})  

        await Cart.findOneAndDelete({_id : orderID})

         res.status(200).json({
            success: true,
            message: 'Payment captured successfully!',
            order: order
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'There was an error capturing payment!'
        })
    }
}


const getAllOrdersByUser = async (req, res) => {

    
    try {
        const { userID } = req.params

        console.log(userID);
        
        const orders = await Order.find({userId : userID})

        if (!orders.length) {
            res.status(400).json({
                success : false,
                message : 'No orders were found!'
            })
        }

        res.status(200).json({
            success : true,
            data : orders
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : 'There was an error getting orders!'
        })
        
    }
    
}

const getOrderDetails = async (req, res) => {

    
    try {
        const { orderID } = req.params

        console.log(orderID);
        
        const order = await Order.findById(orderID)

        if (!order) {
            res.status(400).json({
                success : false,
                message : 'Order not found!'
            })
        }

        res.status(200).json({
            success : true,
            data : order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : 'There was an error getting orders!'
        })
        
    }
    
}

module.exports = { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails }
