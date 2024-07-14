const express = require('express');
const router = express.Router()
const OrderSchema = require('../Modules/order')
const orderItemSchema = require('../Modules/order-item')
router.post('/', async (req, res) => {
    try {
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async order => {
            let newOrderItem = new orderItemSchema({
                product: order.product,
            })
            
            await newOrderItem.save()

            return newOrderItem._id
        }))

        let order = new OrderSchema({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            phone: req.body.phone,
            status: req.body.status,
            price: req.body.price,
            user: req.body.user, 
        })
        await order.save()

        if(!order)
            return res.status(400).send('The order cannot be created')
        res.send(order)
    } catch(error) {
        console.log("Error: " + error)
        return res.status(404).json('something went wrong')
    }
})
router.get('/', async (req, res) => {
    const orderList = await OrderSchema.find().populate('user', 'username email')
    if(!orderList)
        return res.status(500).json({ success: false })
    res.send(orderList)
})
router.get('/:id', async (req, res) => {
    const order = await OrderSchema.findById(req.params.id)
        .populate('user', 'username email')
        .populate({ path: 'orderItems', populate: 'product' });
    if(!order)
        return res.status(500).json({ success: false })

    res.send(order)
})

module.exports = router