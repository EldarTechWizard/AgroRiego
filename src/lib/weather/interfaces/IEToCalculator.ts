import { WeatherData } from "../types";

export interface IEToCalculator {
  calculateETo(weatherData: WeatherData): number;
  getMethod(): string;
}
