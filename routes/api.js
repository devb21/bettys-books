// routes/api.js
const express = require('express');
const router = express.Router();

// Handle GET request for the list of books with an optional search_term
router.get('/books', function (req, res, next) {
    // Check if the database connection is initialized
    if (!global.db) {
        return res.status(500).json({ error: "Database connection is not initialized" });
    }

    // Base query to get all books
    let sqlquery = "SELECT * FROM books"; 
    let queryParams = []; // To hold query parameters for dynamic queries

    // Check if there's a search_term query parameter
    if (req.query.search_term) {
        const searchTerm = `%${req.query.search_term}%`; // Wildcards for partial matching
        sqlquery += " WHERE name LIKE ?"; // Update SQL query to include WHERE clause
        queryParams.push(searchTerm); // Add the search term to parameters
    }

    // Execute the SQL query
    global.db.query(sqlquery, queryParams, (err, result) => {
        if (err) {
            console.error("Database query error:", err); // Log the error
            return res.status(500).json(err); // Respond with the error in JSON format
        } else {
            res.json(result); // Respond with the books data in JSON format
        }
    });
});

module.exports = router; // Export the router for use in the main application
