import axios from 'axios';
import { WeatherResponse } from '../types/weather.js';

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

export async function getCoordinates(city: string) {
    const response = await axios.get(
        `${API_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.data?.[0]) {
        throw new Error('City not found');
    }
    
    return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
        name: response.data[0].name
    };
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherResponse> {
    const response = await axios.get(
        `${API_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    return response.data;
} 