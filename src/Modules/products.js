const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold'],
        default: 'available'
    },
    images: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ]
}, {
    collection: 'products',
    timestamps: true,
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeoutMS: 30000
    }
})

module.exports = mongoose.model('products', productSchema);