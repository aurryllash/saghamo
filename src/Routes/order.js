const express = require('express');
const router = express.Router()
const OrderSchema = require('../Modules/order')
const orderItemSchema = require('../Modules/order-item');
router.post('/', async (req, res) => {
    try {
        
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async order => {
            let newOrderItem = new orderItemSchema({
                product: order.product,
            })
            
            await newOrderItem.save()

            return newOrderItem._id
        }))
        // let totalPrice = 0
        const price = await Promise.all(orderItemsIds.map(async itemsId => {
            let newOrderItems = await orderItemSchema.findById(itemsId).populate('product', 'price');
            let price = newOrderItems.product.price;
            // totalPrice += price
            return price
        }))
        const totalPrice = price.reduce((a, b) => a + b, 0)
        let order = new OrderSchema({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
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
router.put('/:id', async (req, res) => {
    try {
        const order = await OrderSchema.findByIdAndUpdate(req.params.id, 
            {
                status: req.body.status
            },
            {
                new: true
            }
        )
        if(!order)
            return res.status(500).json({ success: false })
    
        res.send(order)
    } catch(error) {
        console.log("Error: " + error)
        return res.status(404).json({ succes: false, message: "something Went Wrong" })
    }
})
router.delete('/:id', async (req, res) => {
    try {
        const order = await OrderSchema.findByIdAndDelete(req.params.id)
        const orderItem = await orderItemSchema.deleteMany({ _id: order.orderItems })

        if(order && orderItem) {
            return res.status(200).json({ success: true, message: "order is deleted" })
        } else {
            return res.status(200).json({ success: false, message: "Error during order delation" })
        }
    } catch(error) {
        console.log("Error: " + error)
        return res.status(404).json({ succes: false, message: "something Went Wrong" })
    }
    
})
router.get('/get/totalSales', async (req, res) => {
    try {
        const totalSales = await OrderSchema.aggregate([
            {
                $group: { 
                    _id: null, 
                    totalSales: { $sum: { $toDouble: '$totalPrice' } },
                    totalCount: { $sum: 1 }
                }
            }
        ])
        if(!totalSales) 
            return res.status(500).json({ succes: false, message: 'cannot get total sales' })
        res.send({totalSales: totalSales.pop() })
    } catch(error) {
        console.log("Error: " + error)
        return res.status(404).json({ succes: false, message: "something Went Wrong" })
    }  
})
router.get('/get/userorders/:userId', async (req, res) => {
    const orderHistory = await OrderSchema.find({ user: req.params.userId })
        .populate({ path: 'orderItems', populate: "product"})
        .sort({ 'dateOrdered': -1 })
    if(!orderHistory)
        return res.status(500).json({ success: false })
    res.send(orderHistory)
})

module.exports = router