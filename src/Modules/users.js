const mongoose = require('mongoose')
const joi = require('joi')
const { Schema } = mongoose;

const usersSchema = new Schema({
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
    },
    purchasedProductsIds: [
        {
            type: Schema.Types.ObjectId,
            ref: 'products'
        }
    ],
    phone: {
        type: Number
    }
    }, {
        collection: 'users',
        timestamps: true,
        read: 'nearest',
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeoutMS: 30000
        }
})

function userValidate(user) {
    const schema = joi.object({
        username: joi.string().min(5).max(100).required(),
        email: joi.string().min(5).max(255).required().email(),
        role: joi.string().valid('user', 'admin'),
        password: joi.string().min(5).max(100).required(),
        phone: joi.number().optional(),
    })

    return schema.validate(user)
}

module.exports.User = mongoose.model('users', usersSchema);
module.exports.UserValidate = userValidate