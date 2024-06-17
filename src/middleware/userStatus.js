const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET;

const setUserStatus = (req, res, next) => {
    const token = req.cookies.token
    if(!token)
        return next()
    req.userIsLoggedIn = false
    req.userIsAdmin = false;
    jwt.verify(token, SECRET, (err, decoded) => {
        if(err) {
            return next();
        }
        req.userIsLoggedIn = true;
        if(decoded.role === admin) {
            req.userIsAdmin = true
        }
    })
    next();
}

module.exports = setUserStatus