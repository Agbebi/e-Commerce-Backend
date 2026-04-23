const Cart = require('../../models/Cart')
const Product = require('../../models/Product')
const User = require('../../models/User')



const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body

        if (!userId || !productId || quantity <= 0) {
            res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const product = await Product.findById(productId)

        if (!product) {
            res.status(400).json({
                success: false,
                message: 'Product was not found!'
            })
        }

        let cart = await Cart.findOne({ userId })

        if (!cart) {
            cart = new Cart({ userId, items: [] })
        }

        const findCurrentProductIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if (findCurrentProductIndex === -1) {
            cart.items.push({ productId, quantity })
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
            path: 'item.productId',
            select: 'image name price salesPrice'
        })

        if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        const validItems = cart.items.filter(productItem => productItem.productId)

        if( validItems.length < cart.items.length ){
            cart.items = validItems

            await cart.save()
        }

        const populateCartItems = validItems.map((item) => ({
            productId : item.productId._id,
            image : item.productId.image,
            name : item.productId.name,
            price : item.productId.price,
            salesPrice : item.productId.salesPrice,
            quantity : item.quantity
        }))


        res.status(200).json({
            success : true,
            data : {
                ...cart._doc, 
                items : populateCartItems 
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
        const { userId, productId, quantity } = req.body

        if (!userId || !productId || quantity <= 0) {
            res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const cart = await Cart.findOne({userId})

         if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        const findCurrentProductIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if(!findCurrentProductIndex){
            return res.status(404).json({
                success : false,
                message : 'Item not found in the cart!'
            })
        }

        cart.items[findCurrentProductIndex].quantity = quantity

        cart.save()

        await Cart.populate({
            path : 'items.productId',
            select : 'image name price salesPrice'
        })

         const populateCartItems = cart.items.map((item) => ({
            productId : item.productId ? item.productId._id : null,
            image : item.productId ? item.productId.image : null,
            name : item.productId ? item.productId.name : 'Product not found',
            price : item.productId ? item.productId.price : null,
            salesPrice : item.productId ? item.productId.salesPrice : null,
            quantity : item.quantity
        }))

        res.status(200).json({
            success : true,
            data : {
                ...cart._doc, 
                items : populateCartItems 
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

const deleteCartItems = async (req, res) => {
    try {
         const { userId, productId } = req.params

        if (!userId || !productId ) {
            res.status(400).json({
                success: false,
                message: 'There is an error in the data provided'
            })
        }

        const cart = await Cart.findOne({userId}).populate({
            path : 'items.productId',
            select : 'image name price salesPrice'
        })

        
         if (!cart) {
            res.status(404).json({
                success: false,
                message: 'Cart not found!'
            })
        }

        cart.items = cart.items.filter(item => item.productId._id.toString() !== productId)

        await cart.save()

        await Cart.populate({
            path : 'items.productId',
            select : 'image name price salesPrice'
        })

         const populateCartItems = cart.items.map((item) => ({
            productId : item.productId ? item.productId._id : null,
            image : item.productId ? item.productId.image : null,
            name : item.productId ? item.productId.name : 'Product not found',
            price : item.productId ? item.productId.price : null,
            salesPrice : item.productId ? item.productId.salesPrice : null,
            quantity : item.quantity
        }))

        res.status(200).json({
            success : true,
            data : {
                ...cart._doc, 
                items : populateCartItems 
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