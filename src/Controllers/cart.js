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
        if(!cart)
            return res.status(404).json('Cart is empty')
        res.send(cart)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}
const delete_from_cart = async (req, res) => {
    try {

        const cart = await CartSchema.findOne({ user: req.user.userId })

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const product = cart.product.findIndex(productId => productId.toString() == req.params.id)

        if (product === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        cart.product.splice(product, 1);

        await cart.save()

        res.send(cart)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}
const put_ready_for_order = async (req, res) => {
    try {
        var cart = await CartSchema.findOne({ user: req.user.userId })
            // .populate('product')

        if(!cart)
            return res.status(404).json('Cart is empty')

        const cartProducts = await Promise.all(cart.product.map(async product =>{
            const productId = product

            const productStatus = await productSchema.findOneAndUpdate(
                { _id: productId, status: { $ne: 'available' }, reservedBy: { $ne: req.user.userId } },
                { $set: { status: 'reserved', reservedBy: req.user.userId } },
                { new: true }
            )
            if(productStatus) {
                cart = await CartSchema.findOneAndUpdate(
                    { _id: cart._id },
                    { $pull: { product: productId } }, {
                        new: true
                    }
                );
                
            }
            return productStatus
        }))
        console.log(cart)
        
        res.send(cart)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}

module.exports = { get_user, post_cart, get_cart, delete_from_cart, put_ready_for_order }