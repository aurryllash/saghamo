const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
const { google } = require('googleapis')
const streamifier = require('streamifier')

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

const pKey = require('./saydumlo-74b07a3e0b17.json')
const SCOPES = ['https://www.googleapis.com/auth/drive']

async function authorize() {
    const jwtClient = new google.auth.JWT(
        pKey.client_email,
        null,
        pKey.private_key,
        SCOPES
    )
    await jwtClient.authorize();
    return jwtClient
}

async function uploadFile(authClient, fileBuffer, filename, mimetype) {
    return new Promise((resolve, rejected)=>{

        const drive = google.drive({version:'v3', auth:authClient}); 

        var fileMetaData = {
            name:filename,
            parents: ['15RtGUfnVmVlQOkL63d0Zdvg52AjBMRnB']
        }

        const file = drive.files.create({
            resource:fileMetaData,

            media:{ 
                // body: fs.createReadStream('./public/images/Hajime-Sorayama.jpg'),
                body: streamifier.createReadStream(fileBuffer),
                mimeType: mimetype
            },
            fields:'id'
        },
        function(error,file){
            if(error){
                return rejected(error)
            }
            resolve(file);
        })
    });
}

app.post('/products/upload', upload.single('image'), async (req, res) => {
    try {
        const authClient = await authorize();

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        const filename = req.file.originalname;

        const file = await uploadFile(authClient, fileBuffer, filename, mimeType)
        const fileId = file.data.id
        if(fileId) {
            const ProductsModule = require('./src/Modules/products')
            req.body.google_drive_file_id = fileId
            await new ProductsModule(req.body).save()
        }
    } catch(error) {
        console.log(error + " something went wrong!!!")
    }
})

app.get('/', (req, res) => {
    res.render('home')
})

// authorize().then(uploadFile).catch("error",console.error());


