require('dotenv').config()
const bcrypt = require('bcrypt')
const { User } = require('../Modules/users')
const jwt = require('jsonwebtoken')
const jwtExpireSeconds = 60
const SECRET = process.env.SECRET

const get_login = (req, res) => {
    res.render('login')
}

const post_login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if(!user) {
            return res.status(401).json({ message: 'Incorrect email or password' })
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match) {
            return res.status(401).json('email or password is wrong.')
        }

        const token = jwt.sign({ userId: user._id, userRole: user.role }, SECRET, { expiresIn: jwtExpireSeconds*60000 });
        res.cookie(
            "token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: jwtExpireSeconds * 60000
        })
        res.status(200).redirect('/home')
    } catch(error) {
        console.log('Error' + error)
        res.status(500).json({ error: 'Login failed' });
    }
}

module.exports = { get_login, post_login }