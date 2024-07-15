const express = require('express');
const router = express.Router()
const { requireLogin } = require('../middleware/RoleSecurity')
const { get_user, post_cart, get_cart, delete_form_cart } = require('../Controllers/cart')

// router.get('/', requireLogin, get_user )
router.post('/:id', requireLogin, post_cart )
router.get('/', requireLogin, get_cart)
router.delete('/:id', delete_form_cart)

module.exports = router