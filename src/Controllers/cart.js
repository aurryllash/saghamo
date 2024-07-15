require('dotenv').config()
const { User } = require('../Modules/users')
const productSchema = require('../Modules/products.js')
const CartSchema = require('../Modules/cart')

const get_user = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId }).lean()
        const { password, ...userData } = user;
        res.send(userData)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}

const post_cart = async (req, res) => {
    try {
        const user_id = req.user.userId
        const product_id = req.params.id
        const product = await productSchema.findOne({ _id: req.params.id, status: 'available' })
        if(!product) 
            throw new Error("product is reserved or already sold")
        
        let cart = await CartSchema.findOne({ user: user_id });

        if (!cart) {
           let newCart = new CartSchema({
                user: user_id,
                product: product_id
            });
            console.log('new Cart: ' + newCart)

            await newCart.save()
        } else {
            if (!cart.product.includes(product_id)) {
                cart.product.push(product_id);
                await cart.save()
            }
        }

    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.') 
    }
}
const get_cart = async (req, res) => {
    try {
        const cart = await CartSchema.findOne({ user: req.user.userId });
        console.log(cart)
        res.send(cart)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}
const delete_form_cart = async (req, res) => {
    try {
        const cart = await CartSchema.findOneAndUpdate(
            { user: req.user.userId },
            { $pull: { product: req.params.id } },
            { new: true }
        );
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        console.log(cart)
        res.send(cart)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}

module.exports = { get_user, post_cart, get_cart, delete_form_cart }