const cloudinary = require('cloudinary').v2
const productSchema = require('../Modules/products')
const Redis = require('ioredis')

const CLOUD_NAME= process.env.CLOUD_NAME;
const API_KEY=process.env.API_KEY 
const API_SECRET=process.env.API_SECRET
const REDIS_URL=process.env.REDIS_URL

const redis = new Redis(REDIS_URL);

const get_file_upload = (req, res) => {
    res.render('add-products')
}
const post_add_file = async (req, res) => {
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

}
const get_all_products = async (req, res) => {
    try {

        var sort = req.query.sort || 'default' 
        const currentSort = sort
        const currentPage = +req.query.page || 1
        var search = req.query.search
        const cachKey = `clothes?page:${currentPage}&sort:${currentSort}`
        const limit = 4;

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
        
        var sortStage = { }
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
        var totalProducts = countResult[0].totalProducts > 0 ? countResult[0].totalProducts : 0;
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
const delete_product = async (req, res) => {
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

module.exports = { get_file_upload, post_add_file, get_all_products, delete_product, get_specific_product }