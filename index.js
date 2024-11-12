// Import express and ejs
var express = require ('express')
var ejs = require('ejs')

// Import mysql module
var mysql = require('mysql2')


var validator = require ('express-validator');

// Create the express application object
const app = express()
const port = 8000
var session = require('express-session')

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and static js)
app.use(express.static(__dirname + '/public'))


const expressSanitizer = require('express-sanitizer');


// Create an input sanitizer
app.use(expressSanitizer());



// Load the API routes
const apiRoutes = require('./routes/api'); // Adjust if necessary


// Import the friendsBooks route
const friendsBooksRoutes = require('./routes/friendsBooks');

// Use the friendsBooks route
app.use('/api', friendsBooksRoutes); // This makes the route accessible at /api/friends-books




/*
I added the session middleware before the route definitions 
(app.use('/', mainRoutes) etc.). 
This ensures that the session is available for all routes in my app.
*/

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))


/* 
The secret parameter in session management, particularly in Express.js, 
is used to sign and verify session cookies. It ensures that the data stored 
in the session can't be tampered with by attackers. The session cookie 
contains a session identifier (or other user data), and the secret is used to 
generate a cryptographic signature, which is appended to the session data. 
When a request is made, the server uses the secret to verify the signature 
and confirm the session data's integrity.

If an attacker guesses or cracks the secret, they could potentially 
forge session cookies, gain unauthorized access to sensitive areas of 
the application, or impersonate other users, including admins. 
This is why the session secret should be a long, random string. 
Using weak or predictable secrets can allow attackers to perform 
dictionary attacks to guess it, especially with the speed of modern 
tools like Hashcat​
Taken from martinfowler.com
​*/

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'bettys_books_app',
    password: 'qwertyuiop',
    database: 'bettys_books'
})

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Define our application-specific data
app.locals.shopData = {shopName: "Bettys Books"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)



app.use('/api', apiRoutes); // This allows requests to /api/books


// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))
