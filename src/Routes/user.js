require('dotenv').config()
const express = require('express');
const router = express.Router()
const { User } = require('../Modules/users')
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET;
const { requireLogin } = require('../middleware/RoleSecurity')

router.get('/', requireLogin, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId }).lean()
        const { password, ...userData } = user;
        res.send(userData)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
})

module.exports = router