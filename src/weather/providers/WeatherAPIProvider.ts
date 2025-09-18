import { IWeatherProvider } from "../interfaces/IWeatherProvider";
import { WeatherData } from "../types";

export class WeatherAPIProvider implements IWeatherProvider {
  constructor(private apiKey: string) {}

  async getWeatherData(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<WeatherData> {
    const dateStr = date.toISOString().split("T")[0];
    const url = `https://api.weatherapi.com/v1/history.json?key=${this.apiKey}&q=${latitude},${longitude}&dt=${dateStr}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const dayData = data.forecast.forecastday[0].day;

      return {
        date: new Date(data.forecast.forecastday[0].date),
        temperatureMax: dayData.maxtemp_c,
        temperatureMin: dayData.mintemp_c,
        humidity: dayData.avghumidity,
        windSpeed: dayData.maxwind_kph * 0.277778, // km/h a m/s
        solarRadiation: undefined,
        location: { latitude, longitude },
      };
    } catch (error) {
      throw new Error(`Error obteniendo datos de WeatherAPI: ${error}`);
    }
  }

  getName(): string {
    return "WeatherAPI";
  }

  supportsDirectETo(): boolean {
    return false;
  }
}
