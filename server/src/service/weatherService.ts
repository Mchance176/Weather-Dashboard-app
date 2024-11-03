import dotenv from 'dotenv';
dotenv.config();

// Interface for geographic coordinates
interface Coordinates {
    lat: number;
    lon: number;
    name: string;
}

// Interface for weather data
interface Weather {
    date: string;
    temp: number;
    humidity: number;
    wind: number;
    icon: string;
    description: string;
}

class WeatherService {
    private baseURL: string = 'https://api.openweathermap.org/data/2.5';
    private apiKey: string = process.env.WEATHER_API_KEY || '';
    private city: string = '';

    // Fetch location coordinates from OpenWeather Geocoding API
    private async fetchLocationData(query: string): Promise<any> {
        const geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
        const response = await fetch(geocodeURL);
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        return response.json();
    }

    // Extract relevant coordinate data from API response
    private destructureLocationData(locationData: any): Coordinates {
        const { lat, lon, name } = locationData[0];
        return { lat, lon, name };
    }

    // Build URL for geocoding API
    //private buildGeocodeQuery(): string {
       // return `${this.baseURL}/weather?q=${this.city}&appid=${this.apiKey}&units=imperial`;
    //}

    // Build URL for weather API using coordinates
    private buildWeatherQuery(coordinates: Coordinates): string {
        return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
    }

    // Combine fetching and processing location data
    private async fetchAndDestructureLocationData(): Promise<Coordinates> {
        const locationData = await this.fetchLocationData(this.city);
        return this.destructureLocationData(locationData);
    }

    // Fetch weather data using coordinates
    private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
        const query = this.buildWeatherQuery(coordinates);
        const response = await fetch(query);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        return response.json();
    }

    // Parse current weather data from API response
    private parseCurrentWeather(response: any): Weather {
        const current = response.list[0];
        return {
            date: new Date(current.dt * 1000).toLocaleDateString(),
            temp: Math.round(current.main.temp),
            humidity: current.main.humidity,
            wind: Math.round(current.wind.speed),
            icon: current.weather[0].icon,
            description: current.weather[0].description
        };
    }

    // Build 5-day forecast array
    private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
        const forecast: Weather[] = [currentWeather];
        
        // Get one reading per day for next 4 days (skipping today)
        const dailyData = weatherData.filter((reading: any, index: number) => {
            const date = new Date(reading.dt * 1000);
            return date.getHours() === 12 && index < 40; // noon reading for each day
        }).slice(0, 4);

        // Add forecast days to array
        dailyData.forEach((day: any) => {
            forecast.push({
                date: new Date(day.dt * 1000).toLocaleDateString(),
                temp: Math.round(day.main.temp),
                humidity: day.main.humidity,
                wind: Math.round(day.wind.speed),
                icon: day.weather[0].icon,
                description: day.weather[0].description
            });
        });

        return forecast;
    }

    // Main method to get weather data for a city
    async getWeatherForCity(city: string): Promise<Weather[]> {
        try {
            this.city = city;
            
            // Get coordinates for the city
            const coordinates = await this.fetchAndDestructureLocationData();
            
            // Get weather data using coordinates
            const weatherData = await this.fetchWeatherData(coordinates);
            
            // Parse current weather
            const currentWeather = this.parseCurrentWeather(weatherData);
            
            // Build and return forecast array
            return this.buildForecastArray(currentWeather, weatherData.list);
        } catch (error) {
            console.error('Error in getWeatherForCity:', error);
            throw error;
        }
    }
}

// Export a single instance of the service
export default new WeatherService();
