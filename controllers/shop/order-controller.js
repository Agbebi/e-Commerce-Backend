const ordersController = require("../../helpers/paypal");
const { ParentOrder, ChildOrder } = require('../../models/Order')
const { Vendor } = require('../../models/User')
const Product = require('../../models/Product')
const Cart = require('../../models/Cart')
const axios = require('axios')
const crypto = require('crypto')
const sha512 = require('js-sha512')

// Opay configuration
const OPAY_BASE_URL = 'https://sandboxapi.opaycheckout.com';
const OPAY_PUBLIC_KEY = 'OPAYPUB17782384347090.6758872452131219'
const OPAY_SECRET_KEY = 'OPAYPRV17782384347090.24215435556647158'
const OPAY_MERCHANT_ID = '281826050879658'
const appUrl = "https://timscommerce.netlify.app"
const localHost = 'http://localhost:5173'

// Function to create Opay payment
const createOpayPayment = async (orderData) => {


    const payload = {
        "country": "EG",
        "reference": orderData.reference || crypto.randomBytes(16).toString('hex'),
        "amount": {
            "total": orderData.totalAmount,
            "currency": "EGP"
        },
        "returnUrl": `${appUrl}/shop/payment`,
        "callbackUrl": `${appUrl}/shop/checkout`,
        "cancelUrl": `${appUrl}/shop/checkout`,
        "expireAt": 300,
        "userInfo": {
            "userEmail": orderData.customerEmail || "test@email.com",
            "userId": orderData.customerId || "userid001",
            "userMobile": orderData.customerPhone || "+201088889999",
            "userName": orderData.customerName || "David"
        },

        "productList": orderData.productList,
        "payMethod": ""
    }

    try {
        const response = await axios.post(`${OPAY_BASE_URL}/api/v1/international/cashier/create`, payload, {
            headers: {
                'Authorization': `Bearer ${OPAY_PUBLIC_KEY}`,
                'MerchantId': OPAY_MERCHANT_ID,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating Opay payment:', error.response?.data || error.message);
        throw error;
    }
};



// Function to check Opay payment status
const checkOpayPaymentStatus = async (reference) => {
    const formData = {
        country: 'EG',
        reference: reference
    };

    var hash = sha512.hmac.create(OPAY_SECRET_KEY);
    hash.update(JSON.stringify(formData));
    hmacsignature = hash.hex();
    try {
        const response = await axios.post(`${OPAY_BASE_URL}/api/v1/international/cashier/status`, formData, {
            headers: {
                'Authorization': `Bearer ${hmacsignature}`,
                'MerchantId': OPAY_MERCHANT_ID,
            }, json: true,
            body: formData
        });
        return response.data;
    } catch (error) {
        console.error('Error checking Opay payment status:', error.response?.data || error.message);
        throw error;
    }
};


const createOrder = async (req, res) => {
    try {
        const { userInfo, cartId, productList, addressInfo, orderStatus, paymentMethod, paymentStatus, totalAmount, orderDate, orderUpdateDate, paymentId, payerId, deliveryStatus } = req.body;

        let parentOrder = await ParentOrder.findOne({ cartId })

        if (!parentOrder) {

            parentOrder = new ParentOrder({
                userId: userInfo.userId,
                userInfo: userInfo,
                cartId: cartId,
                addressInfo: addressInfo,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                orderDate: orderDate,
                childOrders: []
            })


            await parentOrder.save()

            // Create child orders for each vendor

            const itemsByVendor = productList.reduce((acc, item) => {

                const vendorId = item.vendorId;
                if (!acc[vendorId]) {
                    acc[vendorId] = [];
                }
                acc[vendorId].push(
                    {
                        productId: item.productId,
                        name: item.name,
                        imageUrl: item.imageUrl,
                        price: item.price,
                        description: item.description,
                        quantity: item.quantity,
                    }
                );
                return acc;
            }, {});


            const childOrderIds = [];

            for (const vendorId in itemsByVendor) {
                const items = itemsByVendor[vendorId];

                const subTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

                const childOrder = new ChildOrder({
                    parentOrderId: parentOrder._id,
                    vendorId: vendorId,
                    cartItems: items,
                    subTotal: subTotal,
                    payoutDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // Example payout date (7 days from now)
                })
                await childOrder.save();
                childOrderIds.push(childOrder._id);
            }

            parentOrder.childOrders = childOrderIds;
            await parentOrder.save();

        }

        // Create Opay payment
        const opayResponse = await createOpayPayment({
            reference: parentOrder._id.toString(),
            totalAmount: totalAmount,
            customerName: userInfo.userName || 'Customer',
            customerEmail: userInfo.userEmail || 'customer@example.com',
            customerPhone: userInfo.userMobile || '+2340000000000',
            productList: productList
        })


        // Update order with payment reference
        parentOrder.paymentId = opayResponse.data?.reference || opayResponse.reference;
        await parentOrder.save();

        res.cookie('cartId', cartId, { httpOnly: false, secure: true, sameSite: 'none' })

        res.status(200).json({
            success: true,
            data: opayResponse
        })

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
        const { opayReference } = req.params
        const { cartID } = req.body

        // Check Opay payment status
        const statusResponse = await checkOpayPaymentStatus(opayReference);

        if (statusResponse.code !== '00000' || statusResponse.data.status !== 'SUCCESS') {
            return res.status(400).json({
                success: false,
                message: 'Payment not successful or pending'
            });
        }

        // Update Database
        const parentOrder = await ParentOrder.findOneAndUpdate({ paymentId: opayReference }, {
            paymentStatus: 'completed',
        }, { new: true });

        if (!parentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const childOrders = await ChildOrder.find({ parentOrderId: parentOrder._id });

        const vendorIds = childOrders.map(order => order.vendorId)

        for (const childOrder of childOrders) {
            childOrder.payoutStatus = 'completed';
            await childOrder.save();
        }

        await Cart.findByIdAndDelete(cartID)

        const allCartItems = childOrders.flatMap(order => order.cartItems || []);

        // Use string keys to ensure ObjectId instances don't create duplicate keys
        const productQuantityMap = allCartItems.reduce((acc, item) => {
            if (item.productId && typeof item.quantity === 'number') {
                const pid = item.productId.toString();
                acc[pid] = (acc[pid] || 0) + item.quantity;
            }
            return acc;
        }, {});

        const stockUpdatePromises = Object.entries(productQuantityMap).map(([productId, quantity]) => {
            // productId is a string key; update once per unique product
            return Product.findById(productId).then(product => {
                if (!product) return null;
                const quantityBefore = product.totalStock || 0;
                const quantityAfterUpdate = Math.max(0, quantityBefore - quantity);
                // console.log(`Product ${productId} - Quantity Before: ${quantityBefore}, Quantity to reduce: ${quantity}`);

                return Product.findByIdAndUpdate(
                    productId,
                    { totalStock: quantityAfterUpdate },
                    { new: true }
                ).then(updatedProduct => {
                    const quantityAfter = updatedProduct?.totalStock || 0;
                    // console.log(`Product ${productId} - Quantity After: ${quantityAfter}`);
                    return updatedProduct;
                });
            });
        });

        await Promise.all(stockUpdatePromises);

        const vendorDetails = await Vendor.find({ _id: { $in: vendorIds } }).select('phoneNumber _id email');

        for (const vendor of vendorDetails) {
            const message = `You have a new order with reference ${parentOrder._id}. Please check your dashboard for details.`;

            // Here you can integrate with an email service or SMS gateway to send the notification

            // Test WhatsApp API call

            const axios = require('axios');

            const recipientPhone = vendor.phoneNumber ? vendor.phoneNumber.slice(1) : '';
            const data = {
                messaging_product: 'whatsapp',
                to: "234" + recipientPhone, // Replace with the recipient's phone number
                type: 'template',
                template: {
                    name: 'order_waiting', // Replace with your actual template name
                    language: {
                        code: 'en'
                    },
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

        }

        res.status(200).json({
            success: true,
            message: 'Payment captured successfully!',
            order: parentOrder
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'There was an error capturing payment!'
        })
    }
}

const queryPayment = async (req, res) => {
    try {
        const { opayReference } = req.params
        const { cartID, productList } = req.body

        const parentOrder = await ParentOrder.findById(opayReference);

        if (!parentOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check Opay payment status
        const statusResponse = await checkOpayPaymentStatus(opayReference);

        if (statusResponse.data.status === 'SUCCESS') {
            parentOrder.paymentStatus = 'completed';
            await parentOrder.save();

            const childOrders = await ChildOrder.find({ parentOrderId: parentOrder._id });

            for (const childOrder of childOrders) {
                childOrder.payoutStatus = 'completed';
                await childOrder.save();
            }

            await Cart.findByIdAndDelete(cartID)

            for (const vendor of vendorDetails) {

                // Test WhatsApp API call

                const axios = require('axios');

                const recipientPhone = vendor.phoneNumber ? vendor.phoneNumber.slice(1) : '';
                const data = {
                    messaging_product: 'whatsapp',
                    to: "234" + recipientPhone, // Replace with the recipient's phone number
                    type: 'template',
                    template: {
                        name: 'hello_world', // Replace with your actual template name
                        language: {
                            code: 'en_US'
                        },
                    }
                };

                accessToken = 'EAAODhnypZCwsBRvZAZCHeo27ZAqGit4c4ahjLbWeGCFki9cdkcdSatZBZCTPEJWAO9XVRHxUqBYB4BdpTBJ4XVQcjNxZChjeM1EKErOfuNSpeKN3qZAKZBPVwjqxzXr8yV4zSWa1rV3ZBxWYbL1BbBqsgZCGEZAzotVivG6ZBu2j9NcBXdXCjFUjAMVzBfgFdaF5MgdsZBSuZAQ0y7ySJ4CJ76ifxjZCocKsWTewpPX5EySJ3HXJ2sPpGxtCszGUvv7oOcceZBjzRuBLPwuwWpb34HMoTUmFHhXcj'

                axios.post('https://graph.facebook.com/v21.0/1140591912470830/messages', data, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => console.log(response.data, 'Message sent successfully'))
                    .catch(error => console.error(error.response.data));

            }

            return res.status(200).json({
                success: true,
                message: 'Payment captured successfully!',
                order: parentOrder
            })
        } else {

            const newReference = crypto.randomBytes(16).toString('hex');

            const opayResponse = await createOpayPayment({
                reference: newReference,
                totalAmount: parentOrder.totalAmount,
                customerName: parentOrder.userInfo.userName || 'Customer',
                customerEmail: parentOrder.userInfo.userEmail || 'customer@example.com',
                customerPhone: parentOrder.userInfo.userMobile || '+2340000000000',
                productList: productList
            })

            const newPaymentId = opayResponse.data?.reference || opayResponse.reference;

            parentOrder.paymentId = newPaymentId;
            // Do not overwrite _id; use a separate payment reference if needed.

            await parentOrder.save();

            res.status(200).json({
                success: true,
                message: 'Payment captured successfully!',
                order: opayResponse
            })
        }


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
        const { status, sortBy } = req.query

        const filter = { userId: userID }
        const allowedPaymentStatuses = ['pending', 'completed', 'failed']

        if (status && status !== 'all' && allowedPaymentStatuses.includes(status)) {
            filter.paymentStatus = status
        }

        const sortCriteria = { orderDate: -1 }
        if (sortBy === 'oldest') {
            sortCriteria.orderDate = 1
        }

        const orders = await ParentOrder.find(filter).sort(sortCriteria)

        return res.status(200).json({
            success: true,
            data: orders
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error getting orders!'
        })
    }
}

const getOrderDetails = async (req, res) => {


    try {
        const { orderID } = req.params

        const parentOrder = await ParentOrder.findById(orderID)

        if (!parentOrder) {
            res.status(400).json({
                success: false,
                message: 'Parent Order not found!'
            })
        }
        const childOrders = await ChildOrder.find({ parentOrderId: orderID })

        const order = {
            ...parentOrder._doc,
            childOrders: childOrders
        }

        res.status(200).json({
            success: true,
            data: order
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error getting orders!'
        })

    }

}

module.exports = { createOrder, capturePayment, queryPayment, getAllOrdersByUser, getOrderDetails, createOpayPayment, checkOpayPaymentStatus }
