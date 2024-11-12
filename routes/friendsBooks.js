// routes/friendsBooks.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Axios is used for making HTTP requests 

// Define the route to get books from your friend's API
router.get('/friends-books', async (req, res) => {  // The route is defined as /friends-books
    try {
        const apiURL = 'http://localhost:8000/api/books'; // Replace with your friend's API URL
        const apiKey = '1d13d30337528139c3082f9151cd7bf6'; // Replace with your friend's API key

        // Make the HTTP GET request to fetch the books
        const response = await axios.get(apiURL, {
            headers: { 'Authorization': `Bearer ${apiKey}` } // Include API key in the headers if required
        }); 

        // Capture the book data from the response
        const books = response.data;

        // Render a view to display these books
        res.render('friendsBooks.ejs', { books: books });
    } catch (error) {
        console.error("Error fetching friend's books:", error);
        res.status(500).send("Error retrieving friend's books");
    }
});

module.exports = router;
