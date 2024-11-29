// Weather API response types
export interface WeatherResponse {
    list: WeatherDataPoint[];
    city: {
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
    };
}

export interface WeatherDataPoint {
    dt: number;
    main: {
        temp: number;
        humidity: number;
    };
    weather: [{
        id: number;
        main: string;
        description: string;
        icon: string;
    }];
    wind: {
        speed: number;
    };
}

// Search history types
export interface SearchHistoryItem {
    id: string;
    name: string;
    timestamp: string;
}

// API request/response types
export interface WeatherRequest {
    city: string;
}

export interface WeatherApiError {
    error: string;
} 