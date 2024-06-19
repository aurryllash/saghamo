const express = require('express');
const router = express.Router()
const cloudinary = require('cloudinary').v2
const productSchema = require('../Modules/products')
const { requirePermits, requireLogin } = require('../middleware/RoleSecurity')

router.post('/upload', requirePermits('add_product'), async (req, res) => {
    try {

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
            }

        cloudinary.config({ 
            cloud_name: "delmc0t3t", 
            api_key: "724299298349376", 
            api_secret: "S4G2TioPP9ZoqJIaujPRas8h6qw"
        });
            
        const uploadResult = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            asset_folder: 'saydumlo'
        }).catch((error)=>{console.log(error)});

        for (const [key, file] of Object.entries(req.files)) {
            let uploadSecondGradeImages = await cloudinary.uploader.upload(file.tempFilePath, {
                asset_folder: 'saydumlo'
            }).catch((error)=>{console.log(error)})
          }

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
                
        req.body.public_id = uploadResult.public_id
        req.body.url = uploadResult.url
        await new productSchema(req.body).save();

        return res.status(200).json('Uplouded Successfully')

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }

})

router.get('/file/upload', requirePermits('add_product'), (req, res) => {
    res.render('add-products')
})

router.get('/', requireLogin, async (req, res) => {
    const products = await productSchema.aggregate([
        {
            $sort: { createdAt: -1 }
        }
    ])
    res.render('event', { products })
})

router.delete('/file/:id', requirePermits('delete_product'), async (req, res) => {
    try {
    
        const products = await productSchema.findById(req.params.id)
        if(!products) {
            return res.status(400).send('No files were find.')
        }
        cloudinary.config({ 
            cloud_name: "delmc0t3t", 
            api_key: "724299298349376", 
            api_secret: "S4G2TioPP9ZoqJIaujPRas8h6qw"
        });
        const deletedFile = await  cloudinary.uploader.destroy(products.public_id)
        if(deletedFile) {
            const deleteFromDB = await productSchema.findByIdAndDelete(req.params.id)
        }
        return res.status(200).send("Deleted succesfully")
    } catch(error) {
        console.log('something went wrong')
        res.status(404).send('Something went wrong')
    }
    
})

module.exports = router