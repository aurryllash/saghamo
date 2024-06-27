const express = require('express');
const router = express.Router()

const { userNotLoggedIn } = require('../middleware/RoleSecurity')
const { get_login, post_login } = require('../Controllers/login')
router.get('/', userNotLoggedIn, get_login)
router.post('/', userNotLoggedIn, post_login )

module.exports = router