import { IWeatherProvider } from "../interfaces/IWeatherProvider";
import { WeatherData } from "../types/";

export class VisualCrossingProvider implements IWeatherProvider {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error("Visual Crossing API key is required");
    }
  }

  async getWeatherData(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<WeatherData> {
    const dateStr = date.toISOString().split("T")[0];
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/${dateStr}?unitGroup=metric&elements=tempmax,tempmin,humidity,windspeed,solarradiation,precip&key=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid Visual Crossing API key");
        }
        if (response.status === 429) {
          throw new Error("Visual Crossing API rate limit exceeded");
        }
        throw new Error(`Visual Crossing API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.days || data.days.length === 0) {
        throw new Error(
          "No weather data available for the specified date and location"
        );
      }

      const dayData = data.days[0];

      return {
        date: new Date(dayData.datetime),
        temperatureMax: dayData.tempmax || 0,
        temperatureMin: dayData.tempmin || 0,
        humidity: dayData.humidity || 0,
        windSpeed: (dayData.windspeed || 0) * 0.277778, // km/h a m/s
        solarRadiation: dayData.solarradiation * 0.0864 || undefined,
        location: { latitude, longitude },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error obteniendo datos de Visual Crossing: ${error}`);
    }
  }

  getName(): string {
    return "Visual Crossing";
  }

  supportsDirectETo(): boolean {
    return false;
  }

  async getDirectETo(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<number> {
    const dateStr = date.toISOString().split("T")[0];
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}/${dateStr}?unitGroup=metric&elements=et0&key=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.days || data.days.length === 0) {
        throw new Error("No ETo data available");
      }

      return data.days[0].et0 || 0;
    } catch (error) {
      throw new Error(
        `Error obteniendo ETo directo de Visual Crossing: ${error}`
      );
    }
  }
}
