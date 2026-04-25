const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')



//register

const registerUser = async (req, res) => {
    const {userName, email, password} = req.body


    try {

        const checkUser = await User.findOne({email})
        if (checkUser) {return (res.json({
            success: false,
            message: `User already exists. Please use another e-mail.`
        }))};

        // use a standard saltRounds (10) for better security
        const hashPassword = await bcrypt.hash(password, 10)

        // save hashed password to the `password` field expected by the schema
        const newUser = new User({
            userName,
            email,
            password: hashPassword
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

const loginUser = async (req, res) => {
    const {email, password} = req.body


    try {

         const checkUser = await User.findOne({email})
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
            userName : checkUser.userName
        }, 'CLIENT_SECRET_KEY', {expiresIn : '60m'})     
        
        res.cookie('token', token, {{
  httpOnly: true,
  // Use secure: true if in production (HTTPS)
  secure: process.env.NODE_ENV === "production", 
  // 'none' is required for cross-site cookies
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 3600000, // 1 hour
}).json({
            success : true,
            message : 'Logged in successfully',
            user : {
                email : checkUser.email,
                role : checkUser.role,
                id : checkUser._id,
                userName : checkUser.userName
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
    const logoutUser = (req, res) => {
        res.clearCookie('token').json({
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


module.exports = { registerUser, loginUser, logoutUser, authMiddleware }
