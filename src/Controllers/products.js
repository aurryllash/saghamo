require('dotenv').config()
const cloudinary = require('cloudinary').v2
const productSchema = require('../Modules/products')
const { User } = require('../Modules/users')
const Redis = require('ioredis')
const nodemailer = require('nodemailer')
const { ObjectId } = require('mongodb');

const CLOUD_NAME= process.env.CLOUD_NAME;
const API_KEY=process.env.API_KEY 
const API_SECRET=process.env.API_SECRET
const REDIS_URL=process.env.REDIS_URL
const GMAIL_URL = process.env.GMAIL_URL
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD

const redis = new Redis(REDIS_URL);
let sort = 'default'
let currentPage = 1

const get_all_products = async (req, res) => {
    try {

        sort = req.query.sort || 'default' 
        const currentSort = sort
        currentPage = +req.query.page || 1
        var search = req.query.search
        const cachKey = `clothes?page:${currentPage}&sort:${currentSort}`
        const limit = 8;

        if(!search) {
            var countResult = await productSchema.countDocuments();
            var totalProducts = countResult > 0 ? countResult : 0;
            var totalPages = Math.ceil(totalProducts / limit);
        }

        const redisProduct = await redis.get(cachKey);
        if(redisProduct && !search) {

            console.log("returned from redis")
            const products = JSON.parse(redisProduct)

            return res.render('products', { products, totalPages, currentPage, currentSort, search })
        }
        
        var sortStage = {}
        if(currentSort === 'az') {
            sortStage = { 'title': 1 }
        } else if(currentSort === 'za') {
            sortStage = { 'title': -1 }
        } else if(currentSort === 'Time: newly listed') {
            sortStage = { createdAt: -1 }
        } else if(currentSort === 'Time: ending soonest') {
            sortStage = { createdAt: 1 }
        } else {
            sortStage = { createdAt: -1 }
        }

        let seacrhStage = {}
        if(search) {
        seacrhStage = {
            'title': {
                $regex: search,
                $options: 'i'
        }} 
        var countResult = await productSchema.aggregate([
            {
                $match: seacrhStage
            },
            {
                $count: 'totalProducts'
            }
        ])
        let totalProducts = (countResult[0] && countResult[0].totalProducts > 0) ? countResult[0].totalProducts : 0;
        var totalPages = Math.ceil(totalProducts / limit);
        }

        const page = (currentPage-1)*limit
        const products = await productSchema.aggregate([
            {
                $match: seacrhStage
            },
            {
                $sort: sortStage
            },
            {
                $skip: page
            },
            { 
                $limit: limit
            }
        ])

        if(!search) {
            await redis.set(cachKey, JSON.stringify(products), 'EX', 30)
            console.log('quaried from database and set to the redis')
        } else {
            console.log('quaried from database')
        }

        return res.render('products', { products, totalPages, currentPage, currentSort, search })
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }
}
const get_file_upload = (req, res) => {
    res.render('add-products')
}
const post_add_file = async (req, res) => {
    try {
        const cachKey = `clothes?page:${currentPage}&sort:${sort}`
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
            }
            
        await redis.del(cachKey);
        console.log('Key deleted successfully');
        // res.status(202).json({ message: 'File upload request received. Processing in progress.' });

        cloudinary.config({ 
            cloud_name: CLOUD_NAME, 
            api_key: API_KEY, 
            api_secret: API_SECRET
        });

        const imagesArray = Object.values(req.files).map(async file => {
            const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
                        asset_folder: 'saydumlo'
                    }).catch((error)=>{console.log(error)})
            
            const optimizeUrl = cloudinary.url(uploadResult.public_id, {
                fetch_format: 'auto',
                quality: 'auto'
            });
    
            const autoCropUrl = cloudinary.url(uploadResult.public_id, {
                crop: 'auto',
                gravity: 'auto',
                width: 500,
                height: 500,
            });
            const obj = {
                public_id: uploadResult.public_id,
                url: uploadResult.url
            }
            return obj
        })

        const images = await Promise.all(imagesArray)


                
        req.body.images = images;
        await new productSchema(req.body).save();

        

        return res.status(200).json('Uplouded Successfully')

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }

}
const delete_product = async (req, res) => {
    try {
        const cachKey = `clothes?page:${currentPage}&sort:${sort}`
        const products = await productSchema.findByIdAndDelete(req.params.id)
        if(!products) {
            return res.status(400).send('No files were find.')
        }
        
        await redis.del(cachKey);
        console.log('Key deleted successfully');

        cloudinary.config({ 
            cloud_name: CLOUD_NAME, 
            api_key: API_KEY, 
            api_secret: API_SECRET
        });

        const productsArray = Object.values(products.images).map(async file => {
            const deletedFile = await cloudinary.uploader.destroy(file.public_id)
        })
        const destroyedImages = await Promise.all(productsArray)

        res.status(200).send("Deleted succesfully")
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }

}
const get_specific_product = async (req, res) => {
    try {

        const product = await productSchema.findOne({ _id: req.params.id })
    
        res.render('product', { product })

    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }
    
}
function sendEmail(username, useremail, product_id, price, order_date) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_URL,
          pass: GMAIL_PASSWORD
        }
      });
      
      var mailOptions = {
        from: GMAIL_URL,
        to: 'benil92266@carspure.com',
        subject: `New Purchase Notification - Order #${product_id}`,
        text: `
        Hello Admin,

        You have a new purchase on your e-commerce site. Here are the details of the order:

        Customer Information:
        - Name: ${username}
        - Email: ${useremail}
        - Phone Number: 5** *** ***

        Shipping Address:
        - Street Address: ***********
        - City: ***********

        Order Details:
        - Product Id: ${product_id}
        - Order Date: ${order_date}

        Total Amount: ${price} GEL

        Thank you for using our e-commerce platform!

        Best regards,

        Your Second-Hand Company
        contact@saydumlo.com
        (555) 123-4567`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
function sendEmailForClient(username, user_email, product_id, price, order_date, product_name) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_URL,
          pass: GMAIL_PASSWORD
        }
      });
      
      var mailOptions = {
        from: GMAIL_URL,
        to: user_email,
        subject: `Order Confirmation - Order #${product_id}`,
        text: `
        Hello ${username},

        Thank you for your purchase on our e-commerce site. Your order has been successfully processed. Here are the details:
        Order Number: ${product_id}
        Order Date: ${order_date}

        Product Name: ${product_name}
        Amount: ${price} GEL

        Please feel free to contact us at 5** *** *** if you have any questions or concerns regarding your order.

        Thank you again for shopping with us!

        Best regards,

        SAYDUMLO
        `
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
const put_purchase_product = async (req, res) => {
    try {
        const user_id = req.user.userId
        const user = await User.findById(user_id);
        const objectId = new ObjectId(user_id)

        if(!user) {
            throw new Error('User is not found, please log in')
        }

        let product = await productSchema.findOneAndUpdate(
            { _id: req.params.id, status: 'available' },
            { $set: { status: 'reserved', reservedBy: user_id }},
            { new: true } )
        console.log(product.reservedBy)

        if (!product) {
            throw new Error('Product not found, already sold or reserved')
        } 

        const reservedByObjectId = new ObjectId(product.reservedBy);

        if (!objectId.equals(reservedByObjectId)) {
            throw new Error('Product not found, already sold or reserved from objectid');
        }

        // peyments function here if successfull go on!!!

        product = await productSchema.findOneAndUpdate(
            { _id: req.params.id, status: 'reserved', reservedBy: user_id },
            { $set: { status: 'sold'  }},
            { new: true } )
        
        user.purchasedProductsIds.push(product._id);
        await user.save();
        
        // sendEmail(user.username, user.email, product._id, product.price, product.updatedAt)
        // sendEmailForClient(user.username, user.email, product._id, product.price, product.updatedAt, product.title)

        return res.status(200).json('Products has been sold')
    } catch(error) {
        const product = await productSchema.findOneAndUpdate(
            { _id: req.params.id, status: 'reserved' },
            { $set: { status: 'available', reservedBy: null }},
            { new: true } )
        console.log('Error: ' + error)
        res.status(500).send('Something went wrong')
    }
}
const put_change_status = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.id);
        if(!product) {
            throw new Error('Product not found');
        }
        const status = product.status === 'available' ? 'sold' : "available"
        console.log('status: ' + status)
        product.status = status
        product.save()

        return res.status(200).json('update successfully!')
    } catch(error) {
        console.log('Error: ' + error)
        res.status(500).send('Something went wrong')
    }
}

module.exports = { get_file_upload, post_add_file, get_all_products, delete_product, get_specific_product, put_purchase_product, put_change_status }