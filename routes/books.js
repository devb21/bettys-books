const express = require("express");
const router = express.Router();

// Include bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Add redirectLogin middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
};

// Route to display the login form
router.get('/login', function(req, res, next) {
    res.render('login.ejs');
});

// Route to handle login form submission
router.post('/loggedin', function(req, res, next) {
    // Sanitize username and password inputs
    req.body.username = req.sanitize(req.body.username);
    req.body.password = req.sanitize(req.body.password);

    const username = req.body.username;
    const plainPassword = req.body.password;

    // Validate username
    if (!username || username.length < 3 || username.length > 20) {
        return res.send('Login failed: Username must be between 3 and 20 characters.');
    }

    // Validate password
    if (!plainPassword || plainPassword.length < 5) {
        return res.send('Login failed: Password must be at least 6 characters.');
    }

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

router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.send('You are now logged out. <a href="./">Home</a>');
    });
});

router.get('/search', function(req, res, next) {
    res.render("search.ejs");
});

router.get('/search_result', function(req, res, next) {
    // Sanitize search text input
    const searchText = req.sanitize(req.query.search_text);

    // Validate search text
    if (!searchText || searchText.length < 1 || searchText.length > 100) {
        return res.send('Error: Search text must be between 1 and 100 characters.');
    }

    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    db.query(sqlquery, [`%${searchText}%`], (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

router.get('/addbook', function(req, res, next) {
    res.render('addbook.ejs');
});

router.post('/bookadded', function(req, res, next) {
    // Sanitize book name and book price inputs
    req.body.name = req.sanitize(req.body.name);
    req.body.price = req.sanitize(req.body.price);

    const bookName = req.body.name;
    const bookPrice = req.body.price;

    // Validate book name
    if (!bookName || bookName.length < 1 || bookName.length > 100) {
        return res.send('Error: Book name must be between 1 and 100 characters.');
    }

    // Validate book price
    if (isNaN(bookPrice) || bookPrice < 0) {
        return res.send('Error: Price must be a valid non-negative number.');
    }

    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [bookName, bookPrice];
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            return next(err);
        } else {
            res.send('This book is added to the database, name: ' + bookName + ' price ' + bookPrice);
        }
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("bargains.ejs", { availableBooks: result });
    });
});

// Export the router object so index.js can access it
module.exports = router;
