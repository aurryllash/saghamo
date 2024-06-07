const express = require('express')
const app = express()
const mongoose = require('mongoose')
const createReadStream = require('fs').createReadStream;
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
const SCOPES = ['https://www.googleapis.com/auth/drive.file']

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

async function uploadFile(authClient) {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const filePath = path.join(__dirname, 'public/images/Hajime-Sorayama.jpg');

    const file = await drive.files.create({
        media: {
            body: createReadStream(filePath)
        },
        fields: 'id',
        requestBody: {
            name: path.basename(filePath),
        }
    })
    console.log(file.data.id)
}

(async () => {
    try {
      const authClient = await authorize();
      await uploadFile(authClient);
    } catch (error) {
      console.error('Error:', error);
    }
  })();


