const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser')


const productsRoute = require('./src/Routes/products')
const registrationRoute = require('./src/Routes/registration')
const loginRoute = require('./src/Routes/login')
const cartRoute = require('./src/Routes/cart')
const usersRoute = require('./src/Routes/users')
const orderRoute = require('./src/Routes/order')

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(express.json())
app.use(fileUpload({ useTempFiles: true,tempFileDir: '/tmp/' }));


app.use('/clothes', productsRoute)
app.use('/registration', registrationRoute)
app.use('/login', loginRoute)
app.use('/cart', cartRoute)
app.use('/users', usersRoute)
app.use('/order', orderRoute)


mongoose.connect('mongodb://127.0.0.1:27017/aws')
    .then(() => {
        console.log("database is connected successfully!")
        app.listen(3000, () => console.log('Express server is running on port 3000'))

        // require('./src/Backgorund-Tasks/reservationCleanup')
    })
    .catch(error => {
        console.log("Error connecting to mongoDB, Error: " + error)
    })



app.get('/home', (req, res) => {
    res.render('home')
})
app.get('/', (req, res) => {
    res.redirect('/home')
})
app.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/home')
})
app.get('/404', (req, res) => {
    res.render('404')
}) 
app.use((req, res, next) => {
    res.status(404).redirect('/404');
})



