require('dotenv').config()
const express = require('express');
const router = express.Router()
const cloudinary = require('cloudinary').v2
const artistsSchema = require('../Modules/artists')

router.post('/upload', async (req, res) => {
    try {
        
    cloudinary.config({ 
            cloud_name: "delmc0t3t", 
            api_key: "724299298349376", 
            api_secret: "S4G2TioPP9ZoqJIaujPRas8h6qw"
        });
            
        const uploadResult = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            asset_folder: 'artists'
        }).catch((error)=>{console.log(error)});

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
        
        const artist = new artistsSchema({
            name: req.body.name,
            description: req.body.description,
            soundCloud_embed: req.body.SoundcloudEmbedLink,
            links: {
                instagram: req.body.instagram,
                facebook: req.body.facebook,
                youtube: req.body.youtube,
                soundCloud: req.body.soundcloud
            },
            public_id: uploadResult.public_id,
            url: uploadResult.url
        })
        await artist.save();

        return res.status(200).json("Artist added successfully.")

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
})

router.get('/', async (req, res) => {
    try {
        const artists = await artistsSchema.aggregate([ {
            $sort: { createdAt: 1 }
        }])

        if(artists.length === 0) {
            return res.status(204).send('No files were uploaded.');
        }

        res.render('artists', { artists })

    } catch(error) {
        console.error('Error:', error);
        res.status(500).send('Error getting Artists');
    }
    
})

router.get('/upload', (req, res) => {
    res.render('add-artists')
})

router.get('/api/:name', async (req, res) => {
    try {

        const artist = await artistsSchema.aggregate([
            {
                $match: { name: req.params.name }
            }
        ])
        res.render('personal', { artist })
    } catch(error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

module.exports = router