import { IWeatherProvider } from "../interfaces/IWeatherProvider";
import { WeatherData } from "../types";

export class OpenWeatherMapProvider implements IWeatherProvider {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenWeatherMap API key is required");
    }
  }

  async getWeatherData(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<WeatherData> {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return this.getCurrentWeatherData(latitude, longitude, date);
    } else {
      return this.getHistoricalWeatherData(latitude, longitude, date);
    }
  }

  private async getCurrentWeatherData(
    latitude: number,
    longitude: number,
    date: Date
  ): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid OpenWeatherMap API key");
        }
        if (response.status === 429) {
          throw new Error("OpenWeatherMap API rate limit exceeded");
        }
        throw new Error(`OpenWeatherMap API error: ${response.status}`);
      }

      const data = await response.json();
      const today = data.daily[0];

      return {
        date: new Date(today.dt * 1000),
        temperatureMax: today.temp.max,
        temperatureMin: today.temp.min,
        humidity: today.humidity,
        windSpeed: today.wind_speed,
        solarRadiation: today.uvi * 3.6, // Conversión aproximada UV index a MJ/m²/día
        location: { latitude, longitude },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Error obteniendo datos actuales de OpenWeatherMap: ${error}`
      );
    }
  }

  private async getHistoricalWeatherData(
    latitude: number,
    longitude: number,
    date: Date
  ): Promise<WeatherData> {
    const timestamp = Math.floor(date.getTime() / 1000);
    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${latitude}&lon=${longitude}&dt=${timestamp}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `OpenWeatherMap Historical API error: ${response.status}`
        );
      }

      const data = await response.json();
      const dayData = data.data[0];

      return {
        date: new Date(dayData.dt * 1000),
        temperatureMax: dayData.temp,
        temperatureMin: dayData.temp, // Los datos históricos no separan max/min en este endpoint
        humidity: dayData.humidity,
        windSpeed: dayData.wind_speed,
        solarRadiation: (dayData.uvi || 0) * 3.6,
        location: { latitude, longitude },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Error obteniendo datos históricos de OpenWeatherMap: ${error}`
      );
    }
  }

  getName(): string {
    return "OpenWeatherMap";
  }

  supportsDirectETo(): boolean {
    return false;
  }
}
