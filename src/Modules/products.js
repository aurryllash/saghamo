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
    google_drive_file_id: {
        type: String,
        required: true,
    }
}, { timestamps: true })

module.exports = mongoose.model('products', productSchema);