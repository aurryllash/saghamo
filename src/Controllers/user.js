require('dotenv').config()
const { User } = require('../Modules/users')

const get_user = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.userId }).lean()
        const { password, ...userData } = user;
        res.send(userData)
        console.log(req.user.userId)
    } catch(error) {
        console.log('Error: ' + error)
        res.status(404).json('Something Went Wrong.')
    }
}

module.exports = { get_user }