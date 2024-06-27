const express = require('express');
const router = express.Router()
const { userNotLoggedIn } = require('../middleware/RoleSecurity')
const { get_registration, post_registration } = require('../Controllers/registration')

router.get('/', userNotLoggedIn, get_registration )
router.post('/', userNotLoggedIn, post_registration )

module.exports = router