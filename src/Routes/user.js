const express = require('express');
const router = express.Router()
const { requireLogin } = require('../middleware/RoleSecurity')
const { get_user } = require('../Controllers/user')

router.get('/', requireLogin, get_user )

module.exports = router