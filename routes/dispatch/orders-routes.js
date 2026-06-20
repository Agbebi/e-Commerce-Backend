const express = require('express');
const { getOTP, fetchAllOrders,updateOrderStatus, fetchOrderDetails, setDeliver, fetchVendorDetails,getFilteredOrders } = require('../../controllers/dispatch/orders-controller');

const router = express.Router();

router.put('/deliver/:orderId', getOTP);
router.put('/deliver/:orderId/confirmed', setDeliver)

router.get('/:userId/all', getFilteredOrders);
router.post('/details/:userId', fetchOrderDetails);
router.post('details/vendordetails', fetchVendorDetails)
router.put('/update-status/:orderId', updateOrderStatus);


module.exports = router;