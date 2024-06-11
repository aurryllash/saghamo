const mongoose = require('mongoose')

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    soundCloud_embed: {
        type: String,
    },
    links: {
        instagram: {
            type: String,
        },
        facebook: {
            type: String,
        },
        youtube: {
            type: String,
        },
        soundCloud: {
            type: String,
        }
    },
    public_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Artist', artistSchema)
