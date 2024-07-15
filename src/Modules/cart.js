const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users' 
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        // required: true
    }]
}, {
    collection: 'carts',
    timestamps: true,
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeoutMS: 30000
    }
})

module.exports = mongoose.model('carts', CartSchema);