const express = require('express');
const { deliverOrder, fetchAllOrders,updateOrderStatus } = require('../../controllers/admin/orders-controller');

const router = express.Router();

router.put('/deliver/:orderId', deliverOrder);
router.get('/:userId/all', fetchAllOrders);
router.put('/update-status/:orderId', updateOrderStatus);

module.exports = router;