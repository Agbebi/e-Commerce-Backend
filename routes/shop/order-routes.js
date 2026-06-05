const express = require('express');
const { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails, queryPayment } = require('../../controllers/shop/order-controller');



const router = express.Router();


router.post('/create-order', createOrder)
router.post('/payment-status/:opayReference', queryPayment)
router.post('/capture-order/:opayReference', capturePayment)
router.get('/list/:userID', getAllOrdersByUser)
router.get('/details/:orderID', getOrderDetails)

module.exports = router;