// Import necessary libraries
const express = require("express");
const router = express.Router();
const axios = require("axios"); // Ensure axios is used for HTTP requests

// Handle our routes
router.get('/', function(req, res, next) {
    res.render('index.ejs');
});

router.get('/about', function(req, res, next) {
    res.render('about.ejs');
});

router.get('/londonnow', (req, res, next) => {
    // Get city from query parameters, defaulting to 'London'
    let city = req.query.city || 'London';
    let apiKey = '08b26d35ad0e731e08b7e10cfcf9c6b7';
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    // Make a request to the OpenWeather API
    axios.get(url)
        .then(response => {
            const weather = response.data;
            // Prepare the message to display detailed weather information
            let wmsg = `
                <strong>Weather in ${weather.name}, ${weather.sys.country}</strong><br>
                Temperature: ${weather.main.temp}°C<br>
                Condition: ${weather.weather[0].description}<br>
                Humidity: ${weather.main.humidity}%<br>
                Wind Speed: ${weather.wind.speed} m/s<br>
                Direction: ${weather.wind.deg}°<br>
                Pressure: ${weather.main.pressure} hPa<br>
                Clouds: ${weather.clouds.all}%<br>
            `;
            // Render the weather information along with the form
            res.render('weather.ejs', { weather: wmsg, city: city });
        })
        .catch(error => {
            let errorMsg = "Could not fetch the weather data. Please try again.";
            if (error.response && error.response.status === 404) {
                errorMsg = "City not found. Please enter a valid city name.";
            }
            // Render with the error message if any error occurs
            res.render('weather.ejs', { weather: errorMsg, city: city });
        });
});

module.exports = router;
