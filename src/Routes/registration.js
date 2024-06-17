const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const { User, UserValidate } = require('../Modules/users')

router.get('/', (req, res) => {

    res.render('registration')
})

router.post('/', async (req, res) => {
    const { error } = UserValidate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map(detail => detail.message) });
    }
    try {
        const salt = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save();
        res.status(200).send('User Registered Successfully.')
    } catch(error) {
        console.log(error)
        res.status(400).json('Something Went Wrong.')
    }
})

module.exports = router