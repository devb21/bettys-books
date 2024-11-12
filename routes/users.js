// Create a new router
const express = require("express");
const router = express.Router();

// Include bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Include express-validator
const { check, validationResult } = require('express-validator');

// Add redirectLogin middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // redirect to the login page
    } else { 
        next(); // move to the next middleware function
    } 
};

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// Registration route with email validation
router.post('/registered', [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    check('first').notEmpty().withMessage('First name is required'),
    check('last').notEmpty().withMessage('Last name is required')
], function (req, res, next) {
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        // Redirect back to the register page with error messages
        return res.redirect('./register'); // Optionally, you can store errors in session or query params
    }

    // If no validation errors, proceed with registration
  /*  const plainPassword = req.body.password;
    const username = req.body.username;
    const firstName = req.body.first;
    const lastName = req.body.last; */

    const plainPassword = req.body.password;

     // Sanitize the first name and other fields
     const username = req.body.username = req.sanitize(req.body.username);
     const firstName = req.body.first = req.sanitize(req.body.first);
     const lastName = req.body.last = req.sanitize(req.body.last);
     console.log('Sanitized first name:', req.body.first);
   
     req.body.email = req.sanitize(req.body.email);

     bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
        if (err) {
            return next(err);  // Handle error properly
        }

        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
        let newUser = [username, firstName, lastName, req.body.email, hashedPassword];

        db.query(sqlquery, newUser, (err, result) => {
            if (err) {
                return next(err);  // Handle error if something goes wrong
            }

            let resultMessage = 'Hello ' + firstName + ' ' + lastName +
                ', you are now registered! We will send an email to you at ' + req.body.email;
            resultMessage += '<br>Your password is: ' + plainPassword +
                ' and your hashed password is: ' + hashedPassword;

            res.send(resultMessage);
        });  // Close db.query callback
    });  // Close bcrypt.hash callback
});  // Close router.post callback

// Add a route to list users
router.get('/userlist', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT username, first_name, last_name, email FROM users"; // Query to get all users (without password)
    
    // Execute SQL query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);  // Handle error properly
        }
        
        // Render userlist.ejs and pass the result (users) to the view
        res.render("userlist.ejs", {availableUsers: result});
    });
});

// Route to display the login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

// Route to handle login form submission
router.post('/loggedin', function(req, res, next) {
   // const username = req.body.username;
   // const plainPassword = req.body.password;


    // Sanitize username and password inputs
    req.body.username = req.sanitize(req.body.username);
    req.body.password = req.sanitize(req.body.password);

    // Log sanitized input to check for XSS testing
    console.log('Sanitized username:', req.body.username);
    console.log('Sanitized password:', req.body.password);

    const username = req.body.username;
    const plainPassword = req.body.password;
    // Query the database to find the user by username
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err);  // Handle error properly
        }
        if (result.length === 0) {
            // No user found with this username
            return res.send('Login failed: User not found.');
        }

        // Compare the password
        const hashedPassword = result[0].hashedPassword;
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) {
                return next(err);  // Handle error properly
            }
            if (isMatch) {
                // Password matches
                const firstName = result[0].first_name;
                const lastName = result[0].last_name;

                req.session.userId = req.body.username;

                let resultMessage = 'Hello ' + firstName + ' ' + lastName +
                    ', you have successfully logged in!';
                res.send(resultMessage);
            } else {
                // Password does not match
                res.send('Login failed: Incorrect password.');
            }
        });
    });
});

// Logout route
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.send('You are now logged out. <a href=' + '/' + '>Home</a>');
    });
});

// Export the router object so index.js can access it
module.exports = router;
