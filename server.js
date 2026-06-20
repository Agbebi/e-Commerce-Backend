const express = require("express")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const shopAuthRouter = require('./routes/auth/shop/auth-routes')
const dispatchAuthRouter = require('./routes/auth/dispatch/auth-routes')
const vendorAuthRouter = require('./routes/auth/vendor/auth-routes')
const adminProductsRouter = require('./routes/admin/products-routes')
const shopProductsRouter = require('./routes/shop/product-routes')
const shopCartRouter = require('./routes/shop/cart-routes')
const addressRouter = require('./routes/shop/address-routes')
const orderRouter = require('./routes/shop/order-routes')
const adminOrdersRouter = require('./routes/admin/orders-routes')
const dispatchOrdersRouter = require('./routes/dispatch/orders-routes')
const shopSearchRouter = require('./routes/shop/search-routes')


const PORT = process.env.PORT || 3000

const app = express()

const appUrl = "https://timscommerce.netlify.app"
const localHost = 'http://localhost:5173'


// Connecting to Database
mongoose.connect('mongodb+srv://agbebitimothy8_db_user:Tims2000@tims.kjghuix.mongodb.net/shop')
    .then(() => console.log('MongoDB is connected')
    )
    .catch((error) => console.log(error))


app.use(
    cors({
        origin: localHost,
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
app.use('/api/auth', shopAuthRouter)
app.use('/api/auth/dispatch', dispatchAuthRouter)
app.use('/api/auth/vendor', vendorAuthRouter)

app.use('/api/admin/products', adminProductsRouter)
app.use('/api/admin/orders', adminOrdersRouter)

app.use('/api/shop/products', shopProductsRouter)
app.use('/api/shop/cart', shopCartRouter)
app.use('/api/shop/address', addressRouter)
app.use('/api/shop/order', orderRouter)
app.use('/api/shop/search', shopSearchRouter)

app.use('/api/dispatch/orders', dispatchOrdersRouter)

app.set('trust proxy', 1)
app.listen(PORT, console.log(
    `Server started successfully at ${PORT}`
))


