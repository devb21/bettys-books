// routes/tvShows.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Axios for making HTTP requests

// GET request for TV shows search form
router.get('/tv-shows', (req, res) => {
    res.render('tvShowsSearch.ejs'); // Render search form
});

// POST request to search for TV shows
router.post('/tv-shows/search', async (req, res) => {
    const searchTerm = req.body.searchTerm; // Get search term from form
    try {
        // API call to search for shows
        const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchTerm)}`);
        const shows = response.data; // Get the shows from the response

        // Render the results page with the shows
        res.render('tvShowsResults.ejs', { shows: shows });
    } catch (error) {
        console.error("Error fetching TV shows:", error);
        res.status(500).send("Error retrieving TV shows");
    }
});

module.exports = router; // Export the router
