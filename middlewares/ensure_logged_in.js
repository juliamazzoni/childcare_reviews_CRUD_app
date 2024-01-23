function ensureLoggedIn(req, res, next){
    if(req.session.userId){
        next()
    }else{
        res.render('login_message_plus_form')
    }
}

module.exports = ensureLoggedIn