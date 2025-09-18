export interface WeatherData {
  date: Date;
  temperatureMax: number;      // °C
  temperatureMin: number;      // °C
  humidity: number;            // %
  windSpeed: number;           // m/s
  solarRadiation?: number;     // MJ/m²/día
  location: {
    latitude: number;
    longitude: number;
  };
}