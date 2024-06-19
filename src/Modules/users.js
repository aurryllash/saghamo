const mongoose = require('mongoose')
const joi = require('joi')

const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

function userValidate(user) {
    const schema = joi.object({
        username: joi.string().min(5).max(100).required(),
        email: joi.string().min(5).max(255).required().email(),
        role: joi.string().valid('user', 'admin'),
        password: joi.string().min(5).max(100).required(),
    })

    return schema.validate(user)
}

module.exports.User = mongoose.model('User', usersSchema);
module.exports.UserValidate = userValidate