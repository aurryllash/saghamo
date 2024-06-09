const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload');
const productsRoute = require('./src/Routes/products')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(express.json())
app.use(fileUpload({ useTempFiles: true,tempFileDir: '/tmp/' }));
app.use('/products', productsRoute)


mongoose.connect('mongodb://127.0.0.1:27017/aws')
    .then(() => {
        console.log("database is connected successfully!")
        app.listen(3000, () => console.log('Express server is running on port 3000'))
    })
    .catch(error => {
        console.log("Error connecting to mongoDB, Error: " + error)
    })


app.get('/', (req, res) => {
    res.json('sdsfsd')
})



