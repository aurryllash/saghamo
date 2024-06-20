const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const { User, UserValidate } = require('../Modules/users')
const { userNotLoggedIn } = require('../middleware/RoleSecurity')

router.get('/', userNotLoggedIn, (req, res) => {

    res.render('registration')

})

router.post('/', userNotLoggedIn, async (req, res) => {
    const { error } = UserValidate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details.map(detail => detail.message) });
    }
    try {
        const checkUser = await User.findOne( { email: req.body.email } )
        if(checkUser) {
            return res.status(409).json('User already exist')
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        await user.save();
        return res.redirect('/login')
    } catch(error) {
        console.log(error)
        res.status(400).json('Something Went Wrong.')
    }
})

module.exports = router