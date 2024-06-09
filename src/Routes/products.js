const express = require('express');
const router = express.Router()
const cloudinary = require('cloudinary').v2
const productSchema = require('../Modules/products')


router.post('/upload', async (req, res) => {
    try {

        (async function() {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
              }
            // Configuration
        cloudinary.config({ 
            cloud_name: "delmc0t3t", 
            api_key: "724299298349376", 
            api_secret: "S4G2TioPP9ZoqJIaujPRas8h6qw"
        });
            
        const uploadResult = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            asset_folder: 'saydumlo'
        }).catch((error)=>{console.log(error)});
            
        console.log(uploadResult);
        req.body.public_id = uploadResult.public_id
        req.body.url = uploadResult.url
        await new productSchema(req.body).save();
        })();

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
})

router.get('/file/upload', (req, res) => {
    res.render('add-products')
})

module.exports = router