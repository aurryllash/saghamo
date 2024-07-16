const express = require('express');
const router = express.Router()
const { requirePermits, requireLogin } = require('../middleware/RoleSecurity')
const { get_file_upload, post_add_file, get_all_products, delete_product, get_specific_product, put_purchase_product, put_change_status } = require('../Controllers/products')


router.get('/', get_all_products)
router.post('/', requirePermits('add_product'), post_add_file)
router.delete('/:id', requirePermits('delete_product'), delete_product)
router.get('/upload', requirePermits('add_product'), get_file_upload)
router.get('/:id', get_specific_product)
router.put('/purchase/:id', requireLogin, put_purchase_product )
router.put('/status/change/:id', requirePermits('status_change'), put_change_status)


module.exports = router