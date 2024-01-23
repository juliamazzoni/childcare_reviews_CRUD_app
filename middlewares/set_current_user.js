require('dotenv').config()
const db = require('../db/index.js')

function setCurrentUser(req, res, next){
    res.locals.currentUser = {}
    res.locals.isLoggedIn = false

    if(!req.session.userId){
        return next()
    }

    const sql = `
        SELECT * FROM users 
        WHERE id= $1;
        `
        
    db.query(sql, [req.session.userId], (err, result) => {
        //set current user 
        res.locals.currentUser = result.rows[0]
        res.locals.isLoggedIn = true
        next()
    })
}

module.exports = setCurrentUser