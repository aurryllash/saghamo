require('dotenv').config()
const express = require('express');
const router = express.Router()
const { User } = require('../Modules/users');
const { requirePermits } = require('../middleware/RoleSecurity');
const { findByIdAndDelete } = require('../Modules/products');

router.get('/', requirePermits('see_users'), (req, res) => {
    User.find()
        .then(users => {
            res.render('users', { users })
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Server Error');
        });
})
router.delete('/delete/:id', async (req, res) => {
    console.log(req.params.id)
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(user) {
            return res.status(200).json('deleted successfully')
        }
    } catch(error) {
        console.log(error)
        res.status(500).send('Server Error');
    }
})

module.exports = router