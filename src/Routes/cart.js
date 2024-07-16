const express = require('express');
const router = express.Router()
const { requireLogin } = require('../middleware/RoleSecurity')
const { get_user, post_cart, get_cart, delete_from_cart, put_ready_for_order } = require('../Controllers/cart')

// router.get('/', requireLogin, get_user )
router.post('/:id', requireLogin, post_cart )
router.get('/', requireLogin, get_cart)
router.delete('/:id', requireLogin, delete_from_cart)
router.put('/', requireLogin, put_ready_for_order)

module.exports = router