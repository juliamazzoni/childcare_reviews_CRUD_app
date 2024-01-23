require('dotenv').config()

const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const port = 8080
const db = require('./db')
const session = require('express-session')
const setCurrentUser = require('./middlewares/set_current_user')
const ensureLoggedIn = require('./middlewares/ensure_logged_in.js')
const requestLogger = require('./middlewares/request_logger.js');
const methodOverride = require('method-override')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(methodOverride('_method'))
app.use(requestLogger)

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(setCurrentUser)
app.use(expressLayouts)
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {

    const sql = 'select * from childcare;'
    
    db.query(sql, (err, result) => {
        if(err) {
            console.log(err)
        }
        let childcares = result.rows

        res.render('home', {
            childcares: childcares,
        })
    })
})

// adding a new review
app.get('/childcare/new', ensureLoggedIn, (req, res) => {
    res.render('new')
})

// review of one specific childcare 
app.get('/childcare/:id', (req, res) => {

    let id = req.params.id

    const sql = `
                select * 
                from childcare 
                where id = $1;
                `
    db.query(sql, [id], (err, result) => {
        if(err) {
            console.log(err)
        }
        let childcare = result.rows[0]

        res.render('show', {
            childcare: childcare 
        })
    })            
})

// deleting a review
app.delete('/childcare/:id', (req, res) => {

    const sql = `
                delete from childcare
                where id = $1
                RETURNING *;
                `
    db.query(sql, [req.params.id], (err, result) => {
        if(err) {
            console.log(err)
        }

        res.redirect('/')

    })
})

// posting a new review
app.post('/', (req, res) => {

    let name = req.body.name    
    let location = req.body.location
    let zipcode = req.body.zipcode
    let imageUrl = req.body.image_url
    let numOfMeals = req.body.number_of_meals
    let provideNappies = req.body.provide_nappies
    let openingHours = req.body.opening_hours
    let dailyFees = req.body.daily_fees
    let userId = req.session.userId
    let review = req.body.review
    

    const sql = `INSERT INTO childcare (name, location, zipcode, image_url, number_of_meals, provide_nappies, opening_hours, daily_fees, user_id, review) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`

    db.query(sql, [name, location, zipcode, imageUrl, numOfMeals, provideNappies, openingHours, dailyFees, userId, review], (err, result) => {

        if(err){
            console.log(err)
        }

        res.redirect('/')
    })
})

// editting childcare review form

app.get('/childcare/:id/edit', (req, res) => {

    const sql = `
                SELECT * FROM childcare
                WHERE id=$1;
                `
    db.query(sql, [req.params.id], (err, result) => {
        if(err){
            console.log(err)
        }

        let childcare = result.rows[0]

        res.render('edit_childcare_form', {
            childcare: childcare
        })
    })
})

// editting childcare review

app.put('/childcare/:id', (req, res) => {
    let name = req.body.name    
    let location = req.body.location
    let zipcode = req.body.zipcode
    let imageUrl = req.body.image_url
    let numOfMeals = req.body.number_of_meals
    let provideNappies = req.body.provide_nappies
    let openingHours = req.body.opening_hours
    let dailyFees = req.body.daily_fees
    let review = req.body.review

    const sql = `
                UPDATE childcare 
                SET 
                    name = $1,
                    location = $2,
                    zipcode = $3,
                    image_url = $4,
                    number_of_meals = $5,
                    provide_nappies = $6,
                    opening_hours = $7,
                    daily_fees = $8,
                    review = $9
                WHERE id=${req.params.id}
                `

     db.query(sql, [name, location, zipcode, imageUrl, numOfMeals, provideNappies, openingHours, dailyFees, review], (err, result) => {
        if(err){
            console.log(err)
        }

        res.redirect(`/childcare/${req.params.id}`)
     })           
})

// login form 
app.get('/login', (req, res) => {
    res.render('login')
})

// signup form
app.get('/signup', (req, res) => {
    res.render('signup')
})

// login post
app.post('/login', (req, res) => {

    const sql = `
                SELECT * FROM users
                WHERE email='${req.body.email}'
                `

    db.query(sql, (err, result) => {
        if(err){
            console.log(err)
            res.render('login')
            return
        }

        if(result.rows.length === 0){

            console.log('it looks like you dont have an account yet')
            res.render('signup_message_plus_form')

        }else{

            const plaintextPass = req.body.password
            const hashedPass = result.rows[0].password_digest

            //check password
            bcrypt.compare(plaintextPass, hashedPass, (err, isCorrect) => {
                if(err){
                    console.log(err)
                }

                if(!isCorrect){
                    res.render('login_password_message_plus_form')
                    return
                }

                console.log('user found')
                req.session.userId = result.rows[0].id
                res.redirect('/')
            })
        }
    })
})

app.post('/signup', (req, res) => {
    let name = req.body.name
    let email = req.body.email 
    let plaintextPass = req.body.password 
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, (err, salt) => {

        //hash the plain text password
        bcrypt.hash(plaintextPass, salt, (err, hashedPass) => {
            const sql = `
            INSERT INTO users 
            (name, email, password_digest)  
            VALUES 
            ($1, $2, $3)
            RETURNING id;
            `
            db.query(sql, [name, email, hashedPass], (err, result) => {
                if(err){
                    console.log(err)
                } else{
                    console.log('user created')
                    req.session.userId = result.rows[0].id
                    res.redirect('/')
                }
            })
        })
    })
})

app.delete('/logout', (req, res) => {
    req.session.userId = null
    res.redirect('/')
})



app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})