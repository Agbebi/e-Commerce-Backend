const express = require('express');
const { deliverOrder, fetchAllOrders,updateOrderStatus, fetchOrderDetails } = require('../../controllers/dispatch/orders-controller');

const router = express.Router();

router.put('/deliver/:orderId', deliverOrder);
router.get('/:userId/all', fetchAllOrders);
router.post('/details/:userId', fetchOrderDetails);
router.put('/update-status/:orderId', updateOrderStatus);


module.exports = router;