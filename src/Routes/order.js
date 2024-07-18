const express = require('express');
const router = express.Router()
const { 
    post_order, 
    get_order_list, 
    get_order, 
    put_change_order_status, 
    delete_order,
    get_total_sales,
    get_user_orders,
    handlePaymentCallback 
} = require('../Controllers/order')


router.post('/', post_order )
router.get('/', get_order_list )
router.get('/:id', get_order )
router.put('/:id', put_change_order_status )
router.delete('/:id', delete_order)
router.get('/get/totalSales', get_total_sales )
router.get('/get/userorders/:userId', get_user_orders);
router.post('/payment-callback', handlePaymentCallback)

module.exports = router