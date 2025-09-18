
export type Provider = 'visual-crossing' | 'weather-api' | 'openweathermap';

export interface WeatherConfig {
  primaryProvider: Provider;
  fallbackProvider?: Provider;
  apiKeys: {
    visualCrossing?: string;
    weatherAPI?: string;
    openWeatherMap?: string;
  };
  defaultCalculator: 'penman-monteith' | 'hargreaves';
  retryAttempts: number;
  timeoutMs: number;
}

export const defaultWeatherConfig: WeatherConfig = {
  primaryProvider: 'visual-crossing',
  fallbackProvider: 'weather-api',
  apiKeys: {
    visualCrossing: process.env.VISUAL_CROSSING_API_KEY,
    weatherAPI: process.env.WEATHER_API_KEY,
    openWeatherMap: process.env.OPENWEATHERMAP_API_KEY,
  },
  defaultCalculator: 'penman-monteith',
  retryAttempts: 3,
  timeoutMs: 10000
};
