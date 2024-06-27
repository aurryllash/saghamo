const { User } = require('../Modules/users');

const get_all_users = (req, res) => {
    User.find()
        .then(users => {
            res.render('users', { users })
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Server Error');
        });
}
const delete_user = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(user) {
            return res.status(200).json('deleted successfully')
        }
    } catch(error) {
        console.log(error)
        res.status(500).send('Server Error');
    }
}
const change_user_role = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) {
            return res.status(404).json('User Not Found')
        }

        userRole = user.role === 'meneger' ? 'user' : 'meneger'

        user.role = userRole
        user.save()

        return res.status(200).json('Change role successfully')

    } catch(error) {
        console.log('Error: ' + error)
        return res.status(500).send('Something Went Wrong')
    }
}

module.exports = { get_all_users, delete_user, change_user_role }