const express = require('express');
const router = express.Router()
const cloudinary = require('cloudinary').v2
const productSchema = require('../Modules/products')
const { requirePermits, requireLogin } = require('../middleware/RoleSecurity')
const Redis = require('ioredis')



const CLOUD_NAME= process.env.CLOUD_NAME;
const API_KEY=process.env.API_KEY 
const API_SECRET=process.env.API_SECRET
const REDIS_URL=process.env.REDIS_URL
const REDIS_TOKEN=process.env.REDIS_TOKEN

const redis = new Redis(REDIS_URL);

router.post('/upload', requirePermits('add_product'), async (req, res) => {
    try {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
            }
            
        res.status(202).json({ message: 'File upload request received. Processing in progress.' });
        (async () => {
            try {
              await redis.del('products');
              console.log('Key deleted successfully');
            } catch (err) {
              console.error('Error deleting key:', err);
            }
          })();

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

        

        // return res.status(200).json('Uplouded Successfully')

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }

})

router.get('/file/upload', requirePermits('add_product'), (req, res) => {
    res.render('add-products')
})



router.get('/', async (req, res) => {
    try {

        const redisProduct = await redis.get('products');
        if(redisProduct) {
            console.log("returned from redis")
            const products = JSON.parse(redisProduct)
            return res.render('products', { products })
        }
        const products = await productSchema.aggregate([
            {
                $sort: { createdAt: -1 }
            }
        ])
        await redis.set('products', JSON.stringify(products), 'EX', 300)
        console.log('quaried from database and set to the redis')
        return res.render('products', { products })
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }
})


router.delete('/file/:id', requirePermits('delete_product'), async (req, res) => {
    try {
    
        const products = await productSchema.findByIdAndDelete(req.params.id)
        if(!products) {
            return res.status(400).send('No files were find.')
        }
        
        await redis.del('products');
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

        return res.status(200).send("Deleted succesfully")
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }

})

router.get('/api/:id', async (req, res) => {
    try {

        const product = await productSchema.findOne({ _id: req.params.id })
    
        res.render('product', { product })

    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).send('Something went wrong')
    }
    
})

module.exports = router