const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {User, DispatchAgent, Vendor} = require('../../../models/User')



//register

const registerVendor = async (req, res) => {
    const {shopName, email, password, shopDescription, shopAddress, phoneNumber, bankDetails} = req.body


    try {

        const checkUser = await Vendor.findOne({email})
        if (checkUser) {return (res.json({
            success: false,
            message: `User already exists. Please use another e-mail.`
        }))};

        // use a standard saltRounds (10) for better security
        const hashPassword = await bcrypt.hash(password, 10)

        // save hashed password to the `password` field expected by the schema
        const newUser = new Vendor({
            shopName,
            email,
            password: hashPassword,
            shopDescription,
            shopAddress,
            phoneNumber,
            bankDetails
        })

        await newUser.save()
        res.status(200).json({
            success : true,
            message : 'User registered successfully.'
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Some error occured.'
        })
    }
}

//login

const loginVendor = async (req, res) => {
    const {email, password} = req.body


    try {

         const checkUser = await Vendor.findOne({email})
        if (!checkUser) {return (res.json({
            success: false,
            message: `User doesn't exists. Please sign up a new account.`
        }))};

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password)

        if (!checkPasswordMatch) {
            return(res.json({
                success : false,
                message : `Password is incorrect`
            }))
        }

        const token = jwt.sign({
            id : checkUser._id,
            role : checkUser.role,
            email : checkUser.email,
            shopName : checkUser.shopName
        }, 'CLIENT_SECRET_KEY', {expiresIn : '60m'})     
        
        res.cookie('token', token, {httpOnly : true, secure : true, sameSite : 'none'}).json({
            success : true,
            message : 'Logged in successfully',
            user : {
                email : checkUser.email,
                role : checkUser.role,
                id : checkUser._id,
                shopName : checkUser.shopName,
            }
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success : false,
            message : 'Some error occured.'
        })
    }
}

//logout
    const logoutVendor = (req, res) => {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' }).json({
            success : true,
            message : 'Logged out Successfully'
        }) 
    }


//auth middleware

    const authMiddleware = async (req, res, next) => {
        const token = req.cookies.token
        


        if(!token) return res.status(401).json({
            success : false,
            message : 'Token does not exist!'
        })

        try {
            //decode the token            

            const decoded = jwt.verify(token, "CLIENT_SECRET_KEY")
            req.user = decoded            
            next()
            
        } catch (error) {
            res.status(401).json({
            success : false,
            message : 'There is an authentication error!'
        })
        }
    }


module.exports = { registerVendor, loginVendor, logoutVendor, authMiddleware }
