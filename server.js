// Import required packages
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static('public'));

// API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Route to serve the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// GET route to retrieve search history
app.get('/api/weather/history', async (req, res) => {
    try {
        const history = await fs.readFile('searchHistory.json', 'utf8');
        res.json(JSON.parse(history));
    } catch (error) {
        res.status(500).json({ error: 'Error reading search history' });
    }
});

// POST route to save city and get weather data
app.post('/api/weather', async (req, res) => {
    try {
        const { city } = req.body;
        
        // Get coordinates for the city
        const geoResponse = await axios.get(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_API_KEY}`
        );
        
        const [location] = geoResponse.data;
        if (!location) {
            return res.status(404).json({ error: 'City not found' });
        }

        // Get weather data using coordinates
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`
        );

        // Save city to search history
        const history = JSON.parse(await fs.readFile('searchHistory.json', 'utf8'));
        const newCity = {
            id: uuidv4(),
            name: city,
            timestamp: new Date().toISOString()
        };
        history.push(newCity);
        await fs.writeFile('searchHistory.json', JSON.stringify(history, null, 2));

        res.json({
            city: newCity,
            weather: weatherResponse.data
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing weather request' });
    }
});

// BONUS: DELETE route to remove city from history
app.delete('/api/weather/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const history = JSON.parse(await fs.readFile('searchHistory.json', 'utf8'));
        const filteredHistory = history.filter(city => city.id !== id);
        await fs.writeFile('searchHistory.json', JSON.stringify(filteredHistory, null, 2));
        res.json({ message: 'City removed from history' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting city' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 