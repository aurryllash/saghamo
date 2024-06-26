require('dotenv').config()
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET;
const roles = require('../models/roles')

const requireLogin = (req, res, next) => {
    const token = req.cookies.token

    if(!token)
        return res.status(403).json({ message: 'invalid_access' })


    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'invalid_token' })
        }
        
        req.user = decoded

        next();
    })

}

const userNotLoggedIn = (req, res, next) => {
    const token = req.cookies.token

    if(token)
        return res.status(403).json({ message: 'invalid_access' })
    
    return next()
}

function requirePermits() {

    const permits = []

    if (arguments.length === 0) {
        throw new Error('At least one permit argument is required');
    }

    for(let i=0; i<arguments.length; i++) {
        if(typeof arguments[i] == 'string'){
            permits.push(arguments[i])
        }
    } 


    return (req, res, next) => {
        const token = req.cookies.token

        if(!token)
            return res.status(403).json({ message: 'invalid_access' })

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
              return res.status(401).json({ message: err })
            }
            
            req.user = decoded

            const userRole = req.user.userRole;
            if (!(userRole in roles)) {
                return res.status(403).json({ message: 'Invalid role' });
            }

            for(const permit of permits) {
                if(!(roles[req.user.userRole] || []).includes(permit)) {
                    return res.status(403).json({ message: 'invalid_access' })
                }
            }
            return next()
        })
    }
}

module.exports = { requireLogin, requirePermits, userNotLoggedIn }