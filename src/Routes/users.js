require('dotenv').config()
const express = require('express');
const router = express.Router()
const { User } = require('../Modules/users');
const { requirePermits } = require('../middleware/RoleSecurity');

router.get('/', requirePermits('see_users'), (req, res) => {
    User.find()
        .then(users => {
            res.render('users', { users })
        })
        .catch(err => {
            console.error(err); // Log the error
            res.status(500).send('Server Error'); // Send a server error response
        });
})

module.exports = router