import { WeatherData } from "../types";

export interface IWeatherProvider {
  getWeatherData(
    latitude: number,
    longitude: number,
    date?: Date
  ): Promise<WeatherData>;
  getName(): string;
  supportsDirectETo(): boolean;
}
