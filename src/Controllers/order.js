const mongoose = require('mongoose')
const OrderSchema = require('../Modules/order')
const orderItemSchema = require('../Modules/order-item');
const ProductSchema = require('../Modules/products')
const CartSchema = require('../Modules/cart')
const axios = require('axios')

const post_order = async (req, res) => {
    try {

        const orderItemsIds = await Promise.all(req.body.orderItems.map(async order => {
            const reservedProduct = await ProductSchema.findOne(
                { _id: order.product, status: 'reserved', reservedBy: req.body.user }
            );

            if (!reservedProduct) {
                throw new Error(`Product with ID ${order.product} is no longer available.`);
            }

            let newOrderItem = new orderItemSchema({
                product: order.product,
            })
            
            await newOrderItem.save()

            return newOrderItem._id

        }))

        const price = await Promise.all(orderItemsIds.map(async itemsId => {
            let newOrderItems = await orderItemSchema.findById(itemsId).populate('product', 'price');
            let price = newOrderItems.product.price;
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

        // BOG payment - payment method here if payment saccess go on
        const paymentData = {
            // Fill in the required payment details according to BOG's API documentation
            amount: totalPrice,
            currency: 'GEL',
            order_id: order._id,
            description: 'Your order description',
            success_url: 'https://yourdomain.com/payment-success',
            fail_url: 'https://yourdomain.com/payment-failure',
            callback_url: 'https://yourdomain.com/payment-callback'
        }; 

        const bogResponse = await axios.post('https://bog-api-url-to-generate-payment', paymentData);

        if (bogResponse.status !== 200) {
            return res.status(500).send('Error generating payment URL');
        }

        const paymentUrl = bogResponse.data.payment_url;

        // Redirect user to BOG payment page
        res.status(200).json({ paymentUrl });

        // await Promise.all(req.body.orderItems.map(async order => {

        //     const reservedProduct = await ProductSchema.findOneAndUpdate(
        //         { _id: order.product, status: 'reserved', reservedBy: req.body.user },
        //         { $set: { status: 'sold', reservedBy: null } },
        //         { new: true }
        //     )
        // }))

        // order = await order.save()

        // if(!order)
        //     return res.status(400).send('The order cannot be created')

        // const removeFromCart = await CartSchema.updateMany(
        //     { user: req.body.user },
        //     { $set: { product: [] } },
        //     { new: true }
        // )

        res.send(order)
    } catch(error) {
        console.log("Error: " + error)
        return res.status(404).json('something went wrong')
    }
}
const handlePaymentCallback = async (req, res) => {
    try {
        const { order_id, status } = req.body;
        const order = await OrderSchema.findById(order_id)

        if (!order) {
            return res.status(404).send('Order not found');
        }
        
        if(status === 'success') {
            order.status = 'paid'

            await Promise.all(order.orderItems.map(async order => {
                await ProductSchema.findByIdAndUpdate(
                    { _id: order },
                    { status: 'sold', reservedBy: null }
                )

            }))
            await order.save();
        } else {
            order.status = 'fail'
            await order.save();
        }

        res.status(200).send('Payment status updated');

    } catch(error) {
        console.log("Error: " + error);
        return res.status(500).json('Something went wrong from payment callback section');
    }
}
const get_order_list = async (req, res) => {
    const orderList = await OrderSchema.find().populate('user', 'username email')
    if(!orderList)
        return res.status(500).json({ success: false })
    res.send(orderList)
}
const get_order = async (req, res) => {
    const order = await OrderSchema.findById(req.params.id)
        .populate('user', 'username email')
        .populate({ path: 'orderItems', populate: 'product' });
    if(!order)
        return res.status(500).json({ success: false })

    res.send(order)
}
const put_change_order_status = async (req, res) => {
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
}
const delete_order = async (req, res) => {
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
    
}
const get_total_sales = async (req, res) => {
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
}
const get_user_orders = async (req, res) => {
    const orderHistory = await OrderSchema.find({ user: req.params.userId })
        .populate({ path: 'orderItems', populate: "product"})
        .sort({ 'dateOrdered': -1 })
    if(!orderHistory)
        return res.status(500).json({ success: false, message: 'User do not have an order history' })
    res.send(orderHistory)
}
module.exports = { 
    post_order, 
    get_order_list, 
    get_order, 
    put_change_order_status,
    delete_order,
    get_total_sales,
    get_user_orders,
    handlePaymentCallback
 }