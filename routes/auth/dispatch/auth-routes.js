const express = require('express')
const { registerDispatchAgent, loginDispatchAgent, logoutDispatchAgent, authMiddleware } = require('../../../controllers/auth/dispatch/auth-controller')


const router = express.Router();


router.post('/register', registerDispatchAgent)
router.post('/login', loginDispatchAgent)
router.post('/logout', logoutDispatchAgent)
router.get('/check-auth', authMiddleware, (req, res) => {
    const user = req.user

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({
        success : true,
        message : 'Authenticated User',
        user
    })

})
module.exports = router