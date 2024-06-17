const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../Modules/users')
const jwt = require('jsonwebtoken')
const jwtExpireSeconds = 60

router.get('/', (req, res) => {
    res.render('login')
})

router.post('/', async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })
        if(!user) {
            return res.status(401).json('email or password is wrong.')
        }
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) {
            return res.status(401).json('email or password is wrong.')
        }
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1h',
            });
        res.cookie(
            "token", token, {
            httpOnly: true,
            secure: 'development',
            sameSite: "strict",
            maxAge: jwtExpireSeconds * 60000
        })
        res.status(200).json('Login successfully')
    } catch(error) {
        console.log(error)
        res.status(500).json({ error: 'Login failed' });
    }
})

module.exports = router