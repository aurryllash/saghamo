const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order_item',
        // required: true
    }],
    shippingAddress1: {
        type: String,
        require: true
    },
    shippingAddress2: {
        type: String
    },
    city: {
        type: String,
        require: true
    },
    zip: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true,
        default: 'Pending'
    },
    price: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
    
}, {
    collection: 'order',
    timestamps: true,
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeoutMS: 30000
    }
})

module.exports = mongoose.model('Order', OrderSchema);