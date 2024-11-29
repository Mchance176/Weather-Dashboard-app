import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { getCoordinates, getWeatherData } from '../utils/weatherApi.js';
import type { SearchHistoryItem, WeatherRequest } from '../types/weather.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to search history file
const HISTORY_FILE = path.join(__dirname, '../../../data/searchHistory.json');

// Initialize search history file if it doesn't exist
async function ensureHistoryFile() {
    try {
        await fs.access(HISTORY_FILE);
    } catch {
        await fs.writeFile(HISTORY_FILE, '[]');
    }
}

// Get search history
router.get('/history', async (req, res) => {
    try {
        await ensureHistoryFile();
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history: SearchHistoryItem[] = JSON.parse(data);
        res.json(history);
    } catch (error) {
        console.error('Error reading search history:', error);
        res.status(500).json({ error: 'Failed to read search history' });
    }
});

// Get weather data and save to history
router.post('/', async (req, res) => {
    try {
        const { city } = req.body as WeatherRequest;
        
        // Get coordinates and weather data
        const coords = await getCoordinates(city);
        const weatherData = await getWeatherData(coords.lat, coords.lon);
        
        // Save to history
        await ensureHistoryFile();
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history: SearchHistoryItem[] = JSON.parse(data);
        
        const newCity: SearchHistoryItem = {
            id: uuidv4(),
            name: coords.name,
            timestamp: new Date().toISOString()
        };
        
        history.unshift(newCity);
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
        
        res.json({
            city: newCity,
            weather: weatherData
        });
    } catch (error) {
        console.error('Error processing weather request:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Failed to get weather data'
        });
    }
});

// Delete from history (bonus feature)
router.delete('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await ensureHistoryFile();
        const data = await fs.readFile(HISTORY_FILE, 'utf8');
        const history: SearchHistoryItem[] = JSON.parse(data);
        
        const filteredHistory = history.filter(item => item.id !== id);
        await fs.writeFile(HISTORY_FILE, JSON.stringify(filteredHistory, null, 2));
        
        res.json({ message: 'City removed from history' });
    } catch (error) {
        console.error('Error deleting from history:', error);
        res.status(500).json({ error: 'Failed to delete from history' });
    }
});

export default router; 