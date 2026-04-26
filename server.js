const express = require("express")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routes')
const adminProductsRouter = require('./routes/admin/products-routes')
const shopProductsRouter = require('./routes/shop/product-routes')
const shopCartRouter = require('./routes/shop/cart-routes')
const addressRouter = require('./routes/shop/address-routes')
const orderRouter = require('./routes/shop/order-routes')


const PORT = process.env.PORT || 3000

const app = express()


// Connecting to Database
mongoose.connect('mongodb+srv://agbebitimothy8_db_user:Tims2000@tims.kjghuix.mongodb.net/')
    .then(() => console.log('MongoDB is connected')
    )
    .catch((error) => console.log(error))


app.use(
    cors({
        origin: "https://timscommerce.netlify.app",
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: [
            'Content-Type',
            'Authorisation',
            'Cache-Control',
            'Expires',
            'Pragma'
        ],
        credentials: true
    })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/admin/products', adminProductsRouter)
app.use('/api/shop/products', shopProductsRouter)
app.use('/api/shop/cart', shopCartRouter)
app.use('/api/shop/address', addressRouter)
app.use('/api/shop/order', orderRouter)
app.set('trust proxy', 1)

app.listen(PORT, console.log(
    `Server started successfully at ${PORT}`
))


