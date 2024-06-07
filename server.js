const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const process = require('process')
const { google } = require('googleapis')

app.use(express.static('public'))


mongoose.connect('mongodb://127.0.0.1:27017/aws')
    .then(() => {
        console.log("database is connected successfully!")
        app.listen(3001, () => console.log('Express server is running on port 3000'))
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

async function uploadFile(authClient){
    return new Promise((resolve,rejected)=>{
        const drive = google.drive({version:'v3',auth:authClient}); 
        var fileMetaData = {
            name:'test.txt', // A folder ID to which file will get uploaded
            parents: ['15RtGUfnVmVlQOkL63d0Zdvg52AjBMRnB']
        }

        drive.files.create({
            resource:fileMetaData,
            media:{
                body: fs.createReadStream('test.txt'), // files that will get uploaded
                mimeType:'text/plain'
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

authorize().then(uploadFile).catch("error",console.error());

// (async () => {
//     try {
//       const authClient = await authorize();
//       await uploadFile(authClient);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   })();


