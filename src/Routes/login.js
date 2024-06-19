require('dotenv').config()
const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const { User } = require('../Modules/users')
const jwt = require('jsonwebtoken')
const jwtExpireSeconds = 60
const SECRET = process.env.SECRET
const { userNotLoggedIn } = require('../middleware/RoleSecurity')

router.get('/', userNotLoggedIn, (req, res) => {
    res.render('login')
})

router.post('/', userNotLoggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if(!user) {
            return res.status(400).json({ message: 'Incorrect email or password' })
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match) {
            return res.status(401).json('email or password is wrong.')
        }

        const token = jwt.sign({ userId: user._id, userRole: user.role }, SECRET);
        res.cookie(
            "token", token, {
            httpOnly: true,
            secure: 'development',
            sameSite: "strict",
            maxAge: jwtExpireSeconds * 60000
        })
        res.status(200).json('Login successfully')
    } catch(error) {
        console.log('Error' + error)
        res.status(500).json({ error: 'Login failed' });
    }
})

module.exports = router