import { Router, type Request, type Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Initialize router
const router = Router();

// Define interfaces for type safety
interface WeatherResponse {
  cod: string;
  list: WeatherDataPoint[];
}

interface WeatherDataPoint {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    icon: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

/**
 * POST /api/weather
 * Retrieves weather data for a given city and saves to search history
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    
    // Validate city input
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    // Call OpenWeather API with API key from environment variables
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=imperial`
    );
    const weatherData: WeatherResponse = await response.json();

    // Handle invalid city names or API errors
    if (weatherData.cod !== '200') {
      return res.status(404).json({ message: 'City not found' });
    }

    // Process weather data for current conditions and forecast
    const processedData = processWeatherData(weatherData, city);

    // Save to search history
    await saveToHistory(city);

    return res.json(processedData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error fetching weather data' });
  }
});

/**
 * GET /api/weather/history
 * Retrieves search history from local storage
 */
router.get('/history', async (_req: Request, res: Response) => {
  try {
    // Read the search history file
    const historyPath = path.join(__dirname, '../../data/searchHistory.json');
    const data = await fs.readFile(historyPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading history:', error);
    res.status(500).json({ message: 'Error reading search history' });
  }
});

/**
 * DELETE /api/weather/history/:id
 * Removes a city from search history
 */
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const historyPath = path.join(__dirname, '../../data/searchHistory.json');
    const data = await fs.readFile(historyPath, 'utf8');
    const history = JSON.parse(data);

    // Filter out the city with the matching ID
    const newHistory = history.filter((item: any) => item.id !== req.params.id);
    await fs.writeFile(historyPath, JSON.stringify(newHistory));

    res.json({ message: 'City removed from history' });
  } catch (error) {
    console.error('Error deleting from history:', error);
    res.status(500).json({ message: 'Error deleting from history' });
  }
});

/**
 * Helper function to process weather data into a cleaner format
 */
function processWeatherData(weatherData: WeatherResponse, cityName: string) {
  const processed = [];
  const today = new Date().getDate();

  // Process current weather (first item in the list)
  processed.push({
    city: cityName,
    date: new Date(weatherData.list[0].dt * 1000).toLocaleDateString(),
    icon: weatherData.list[0].weather[0].icon,
    iconDescription: weatherData.list[0].weather[0].description,
    tempF: Math.round(weatherData.list[0].main.temp),
    windSpeed: Math.round(weatherData.list[0].wind.speed),
    humidity: weatherData.list[0].main.humidity
  });

  // Process forecast (next 5 days)
  weatherData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    // Only take noon reading for future dates
    if (date.getDate() !== today && date.getHours() === 12 && processed.length < 6) {
      processed.push({
        date: date.toLocaleDateString(),
        icon: item.weather[0].icon,
        iconDescription: item.weather[0].description,
        tempF: Math.round(item.main.temp),
        windSpeed: Math.round(item.wind.speed),
        humidity: item.main.humidity
      });
    }
  });

  return processed;
}

/**
 * Helper function to save city to search history
 */
async function saveToHistory(cityName: string): Promise<void> {
  const historyPath = path.join(__dirname, '../../data/searchHistory.json');
  let history = [];
  
  try {
    const data = await fs.readFile(historyPath, 'utf8');
    history = JSON.parse(data);
  } catch {
    // If file doesn't exist, we'll create it
  }

  // Add city if not already in history
  if (!history.find((item: any) => item.name === cityName)) {
    history.unshift({
      id: Date.now().toString(),
      name: cityName
    });
    // Keep only last 5 searches
    history = history.slice(0, 5);
    await fs.writeFile(historyPath, JSON.stringify(history));
  }
}

export default router;
