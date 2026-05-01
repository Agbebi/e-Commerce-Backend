const express = require('express');
const { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails } = require('../../controllers/shop/order-controller');



const router = express.Router();


router.post('/create-order', createOrder)
router.post('/capture-order/:orderID', capturePayment)
router.get('/list/:userID', getAllOrdersByUser)
router.get('/details/:orderID', getOrderDetails)

module.exports = router;