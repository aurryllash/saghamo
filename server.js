const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
const streamifier = require('streamifier')
const cloudinary = require('cloudinary').v2

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(express.json())


mongoose.connect('mongodb://127.0.0.1:27017/aws')
    .then(() => {
        console.log("database is connected successfully!")
        app.listen(3000, () => console.log('Express server is running on port 3000'))
    })
    .catch(error => {
        console.log("Error connecting to mongoDB, Error: " + error)
    })




app.post('/products/upload', async (req, res) => {
    (async function() {
    
        // Configuration
    cloudinary.config({ 
        cloud_name: "delmc0t3t", 
        api_key: "724299298349376", 
        api_secret: "S4G2TioPP9ZoqJIaujPRas8h6qw" // Click 'View Credentials' below to copy your API secret
    });
        
    // Upload an image
    const uploadResult = await cloudinary.uploader.upload("./public/images/Hajime-Sorayama.jpg", {
        asset_folder: 'saydumlo'
    }).catch((error)=>{console.log(error)});
        
    console.log(uploadResult); 
})();
})

app.get('/', (req, res) => {
    res.render('home')
})



