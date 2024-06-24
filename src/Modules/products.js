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
    read: 'nearest',
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeoutMS: 30000
    }
})

module.exports = mongoose.model('products', productSchema);