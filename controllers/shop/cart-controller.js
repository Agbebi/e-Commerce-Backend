const Cart = require('../../models/Cart')
const Product = require('../../models/Product')
const User = require('../../models/User')



const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, description, name, imageUrl, price, vendorId } = req.body

        if (!userId || !productId || quantity <= 0) {
            res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'Product was not found!'
            })
        }

        let cart = await Cart.findOne({ userId })
        const existingItem = cart?.items.find(item => item.productId.toString() === productId)
        const currentQuantity = existingItem ? existingItem.quantity : 0
        const newQuantity = currentQuantity + quantity

        if (newQuantity > product.totalStock) {
            return res.status(400).json({
                success: false,
                message: 'Max limit reached'
            })
        }

        if (!cart) {
            cart = new Cart({ userId, items: [] })
        }
        if (!cart) {
            cart = new Cart({ userId, items: [] })
        }

        const findCurrentProductIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if (findCurrentProductIndex === -1) {
            cart.items.push({ productId, quantity, description, name, imageUrl, price, vendorId })
        } else {
            cart.items[findCurrentProductIndex].quantity += quantity
        }

        await cart.save()

        res.status(200).json({
            success: true,
            message: 'Product added to Cart successfully',
            data: cart
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error'
        })
    }
}

const fetchCartItems = async (req, res) => {
    try {

        const { userId } = req.params


        if (!userId) {
            return res.status(500).json({
                success: false,
                message: 'UserId is mandatory!'
            })
        }


        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'images image name price salesPrice description vendorId'
        })

        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        const validItems = cart.items.filter(productItem => productItem.productId)

        if (validItems.length < cart.items.length) {
            cart.items = validItems

            await cart.save()
        }

        const populateCartItems = validItems.map((item) => ({
            productId: item.productId._id,
            image: item.productId?.images?.[0] || item.productId?.image || null,
            images: item.productId?.images || (item.productId?.image ? [item.productId.image] : []),
            name: item.productId.name,
            price: item.productId.price,
            salesPrice: item.productId.salesPrice,
            quantity: item.quantity,
            description: item.productId.description,
            vendorId: item.productId.vendorId
        }))


        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error'
        })
    }
}

const updateCartItems = async (req, res) => {
    try {
        const { userId, productId, quantity, description, name, imageUrl, price, vendorId } = req.body

        if (!userId || !productId || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const cart = await Cart.findOne({ userId })

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        const findCurrentProductIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId,
        )

        if (findCurrentProductIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in the cart!'
            })
        }

        console.log('Quantity Before:', cart.items[findCurrentProductIndex].quantity);


        const product = await Product.findById(cart.items[findCurrentProductIndex].productId)

        if (quantity > product.totalStock) {

            await cart.populate({
                path: 'items.productId',
                select: 'images image name price salesPrice description vendorId'
            })

            const populateCartItems = cart.items.map((item) => ({
                productId: item.productId ? item.productId._id : null,
                image: item.productId ? item.productId?.images?.[0] || item.productId.image : null,
                images: item.productId ? item.productId?.images || (item.productId.image ? [item.productId.image] : []) : [],
                name: item.productId ? item.productId.name : 'Product not found',
                price: item.productId ? item.productId.price : null,
                salesPrice: item.productId ? item.productId.salesPrice : null,
                description: item.productId ? item.productId.description : null,
                vendorId: item.productId ? item.productId.vendorId : null,
                quantity: item.quantity
            }))

            return (res.status(200).json({
                success: true,
                message: `Max limit reached... Total Stock remaining is ${product.totalStock}!`,
                data: {
                    ...cart._doc,
                    items: populateCartItems
                },
            }))
        }

        cart.items[findCurrentProductIndex].quantity = quantity

        await cart.save()

        await cart.populate({
            path: 'items.productId',
            select: 'images image name price salesPrice description vendorId'
        })

        const populateCartItems = cart.items.map((item) => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId?.images?.[0] || item.productId.image : null,
            images: item.productId ? item.productId?.images || (item.productId.image ? [item.productId.image] : []) : [],
            name: item.productId ? item.productId.name : 'Product not found',
            price: item.productId ? item.productId.price : null,
            salesPrice: item.productId ? item.productId.salesPrice : null,
            description: item.productId ? item.productId.description : null,
            vendorId: item.productId ? item.productId.vendorId : null,
            quantity: item.quantity
        }))

        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            },
            message: 'Quantity updated successfully!'
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error'
        })
    }
}

const deleteCartItems = async (req, res) => {
    try {
        const { userId, productId } = req.params

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'images image name price salesPrice description vendorId'
        })

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        cart.items = cart.items.filter((item) => {
            const currentProductId = item.productId?._id?.toString() || item.productId?.toString()
            return currentProductId !== productId
        })

        await cart.save()

        await cart.populate({
            path: 'items.productId',
            select: 'images image name price salesPrice description vendorId'
        })

        const populateCartItems = cart.items.map((item) => ({
            productId: item.productId ? item.productId._id : null,
            image: item.productId ? item.productId?.images?.[0] || item.productId.image : null,
            images: item.productId ? item.productId?.images || (item.productId.image ? [item.productId.image] : []) : [],
            name: item.productId ? item.productId.name : 'Product not found',
            price: item.productId ? item.productId.price : null,
            salesPrice: item.productId ? item.productId.salesPrice : null,
            description: item.productId ? item.productId.description : null,
            vendorId: item.productId ? item.productId.vendorId : null,
            quantity: item.quantity
        }))

        res.status(200).json({
            success: true,
            data: {
                ...cart._doc,
                items: populateCartItems
            }
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'There was an error'
        })
    }
}


module.exports = { addToCart, fetchCartItems, updateCartItems, deleteCartItems }