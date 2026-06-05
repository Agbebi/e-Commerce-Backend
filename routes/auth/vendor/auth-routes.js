const express = require('express')
const { registerVendor, loginVendor, logoutVendor, authMiddleware } = require('../../../controllers/auth/vendor/auth-controller')


const router = express.Router();


router.post('/register', registerVendor)
router.post('/login', loginVendor)
router.post('/logout', logoutVendor)
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