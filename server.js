const express = require("express")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRouter = require('./routes/auth/auth-routes')
const adminProductsRouter = require('./routes/admin/products-routes')
const shopProductsRouter = require('./routes/shop/product-routes')
const shopCartRouter = require('./routes/shop/cart-routes')


const PORT = process.env.PORT || 3000

const app = express()


// Connecting to Database
mongoose.connect('mongodb+srv://agbebitimothy8_db_user:Tims2000@tims.kjghuix.mongodb.net/')
    .then(() => console.log('MongoDB is connected')
    )
    .catch((error) => console.log(error))

    const allowedOrigins = [
        'https://e-commerce-tims.netlify.app/', 'http://localhost:5173'
    ]


app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true)
                if(allowedOrigins.indexOf(origin) == -1){
                    const msg = 'The CORS policy for this site does not allow access from the specified origin'
                    return callback(new Error(msg), false)
                }
                return callback(null, true)
        },
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: [
            'Content-Type',
            'Authorisation',
            'Cache-Control',
            'Expires',
            'Pragma'
        ],
        credentials: true,
        optionsSuccessStatus: 200
    })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/admin/products', adminProductsRouter)
app.use('/api/shop/products', shopProductsRouter)
app.use('/api/shop/cart', shopCartRouter)


app.listen(PORT, console.log(
    `Server started successfully at ${PORT}`
))


