import { WeatherData } from "./WeaterData";

export interface EToResult {
  eto: number;                 // mm/día
  method: 'direct' | 'calculated';
  source: string;
  calculatedAt: Date;
  weatherData: WeatherData;
}