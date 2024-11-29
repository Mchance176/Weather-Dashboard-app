// DOM Elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchHistory = document.getElementById('search-history');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

// Load search history when page loads
async function loadSearchHistory() {
    try {
        const response = await fetch('/api/weather/history');
        const history = await response.json();
        renderSearchHistory(history);
    } catch (error) {
        console.error('Error loading search history:', error);
    }
}

// Render search history
function renderSearchHistory(history) {
    searchHistory.innerHTML = '';
    history.forEach(city => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.textContent = city.name;
        div.onclick = () => getWeatherData(city.name);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteCity(city.id);
        };
        div.appendChild(deleteBtn);
        
        searchHistory.appendChild(div);
    });
}

// Get weather data for a city
async function getWeatherData(cityName) {
    try {
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city: cityName })
        });
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        renderWeather(data.weather);
        loadSearchHistory();
    } catch (error) {
        console.error('Error getting weather data:', error);
        alert('Error getting weather data. Please try again.');
    }
}

// Render weather data
function renderWeather(weatherData) {
    // Render current weather
    const current = weatherData.list[0];
    currentWeather.innerHTML = `
        <h2>${weatherData.city.name} (${new Date(current.dt * 1000).toLocaleDateString()})</h2>
        <img src="http://openweathermap.org/img/w/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
        <p>Temperature: ${current.main.temp}°C</p>
        <p>Humidity: ${current.main.humidity}%</p>
        <p>Wind Speed: ${current.wind.speed} m/s</p>
    `;

    // Render 5-day forecast
    forecast.innerHTML = '';
    for (let i = 7; i < weatherData.list.length; i += 8) {
        const day = weatherData.list[i];
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p>Temp: ${day.main.temp}°C</p>
            <p>Wind: ${day.wind.speed} m/s</p>
            <p>Humidity: ${day.main.humidity}%</p>
        `;
        forecast.appendChild(forecastCard);
    }
}

// Delete city from history
async function deleteCity(id) {
    try {
        await fetch(`/api/weather/history/${id}`, {
            method: 'DELETE'
        });
        loadSearchHistory();
    } catch (error) {
        console.error('Error deleting city:', error);
    }
}

// Event listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
        cityInput.value = '';
    }
});

// Initial load
loadSearchHistory(); 