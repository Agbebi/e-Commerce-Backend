const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../../../models/User')
const dotenv = require('dotenv')
const { BrevoClient } = require('@getbrevo/brevo')

dotenv.config()
let nodemailer


const brevo = new BrevoClient({ apiKey: process.env.BREVO_API });


try {
    nodemailer = require('nodemailer')
} catch (error) {
    nodemailer = null
}

const buildVerificationUrl = (token) => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000'
    return `${backendUrl}/api/auth/verify-email/${token}`
}

const sendVerificationEmail = async (email, verificationUrl) => {
    if (!nodemailer) {
        console.log(`Verification email for ${email}: ${verificationUrl}`)
        return { success: false, message: 'Nodemailer is not available.' }
    }

    // if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    //     console.log(`SMTP not configured. Verification email for ${email}: ${verificationUrl}`)
    //     return { success: false, message: 'SMTP is not configured.' }
    // }

    // const transporter = nodemailer.createTransport({
    //     host: 'smtp-relay.brevo.com',
    //     port: 587,
    //     secure: false,
    //     auth: {
    //         user: 'b0a185001@smtp-brevo.com',
    //         pass: process.env.SMTP_PASS
    //     },
    // })

    try {
        // await transporter.sendMail({
        //     from: process.env.SMTP_FROM || process.env.SMTP_USER,
        //     to: email,
        //     subject: 'Verify your email address',
        //     html: `<p>Thanks for signing up. Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`
        // })

        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: 'Verify your email address!',
            htmlContent: `<html><body><p>Hello,</p><p>Thanks for signing up. Please verify your email by clicking <a href="${verificationUrl}</p></body></html>`,
            sender: { name: 'Alex from Brevo', email: 'agbebitimothy8@gmail.com' },
            to: [{ email: email, name: 'John Doe' }],
        });

        console.log('Email sent. Message ID:', result.messageId);
        console.log(verificationUrl, 'Verification Url');
        

        return { success: true }
    } catch (error) {
        console.error('Email delivery failed:', error.message)
        console.log(`Verification email for ${email}: ${verificationUrl}`)
        return { success: false, message: error.message }
    }
}

//register

const registerUser = async (req, res) => {
    const { userName, email, password, name, phoneNumber } = req.body


    try {

        const existingUser = await User.findOne({ $or: [{ email }, { userName }] })
        if (existingUser) {
            return res.json({
                success: false,
                message: existingUser.email === email
                    ? 'A user with this email already exists.'
                    : 'This username is already taken.'
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const verificationToken = jwt.sign({
            id: null,
            email,
            purpose: 'email-verification'
        }, 'CLIENT_SECRET_KEY', { expiresIn: '24h' })

        const newUser = new User({
            userName,
            email,
            password: hashPassword,
            name,
            phoneNumber,
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })

        await newUser.save()
        const verificationUrl = buildVerificationUrl(verificationToken)
        const emailResult = await sendVerificationEmail(email, verificationUrl)

        res.status(200).json({
            success: true,
            message: emailResult.success
                ? 'Account created. Please verify your email before logging in.'
                : 'Account created, but email delivery is not configured yet. Please use the verification link from the server console.',
            verificationUrl
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Some error occured.'
        })
    }
}

//login

const loginUser = async (req, res) => {
    const { email, password } = req.body


    try {

        const checkUser = await User.findOne({ email })
        if (!checkUser) {
            return (res.json({
                success: false,
                message: `User doesn't exists. Please sign up a new account.`
            }))
        };

        if (!checkUser.isEmailVerified) {
            return res.json({
                success: false,
                message: 'Please verify your email before logging in.'
            })
        }

        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password)

        if (!checkPasswordMatch) {
            return (res.json({
                success: false,
                message: `Password is incorrect`
            }))
        }

        const token = jwt.sign({
            id: checkUser._id,
            role: checkUser.role,
            email: checkUser.email,
            userName: checkUser.userName,
            name: checkUser.name,
            phoneNumber: checkUser.phoneNumber
        }, 'CLIENT_SECRET_KEY', { expiresIn: '120m' })

        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' }).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
                name: checkUser.name,
                phoneNumber: checkUser.phoneNumber
            }
        })

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Some error occured.'
        })
    }
}

//logout
const logoutUser = (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' }).json({
        success: true,
        message: 'Logged out Successfully'
    })
}


//auth middleware

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token



    if (!token) return res.status(401).json({
        success: false,
        message: 'Token does not exist!'
    })

    try {
        //decode the token            

        const decoded = jwt.verify(token, "CLIENT_SECRET_KEY")
        req.user = decoded
        next()

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'There is an authentication error!'
        })
    }
}


const verifyEmail = async (req, res) => {
    const token = req.params.token || req.query.token

    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY')
        const user = await User.findOne({ email: decoded.email })

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?status=invalid`)
        }

        if (user.isEmailVerified) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?status=already-verified`)
        }

        if (user.emailVerificationToken !== token || new Date(user.emailVerificationExpiresAt) < new Date()) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?status=expired`)
        }

        user.isEmailVerified = true
        user.emailVerificationToken = undefined
        user.emailVerificationExpiresAt = undefined
        await user.save()

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?status=success`)
    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?status=invalid`)
    }
}

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, verifyEmail }
