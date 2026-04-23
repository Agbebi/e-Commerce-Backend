const express = require('express');

const { addAddress, deleteAddress, fetchAddresses, editAddress } = require('../../controllers/shop/address-controller');

const router = express.Router();

router.post('/add', addAddress);
router.get('/get/:userId', fetchAddresses);
router.put('/update/:userId/:addressId', editAddress);
router.delete('/delete/:userId/:addressId', deleteAddress);

module.exports = router;