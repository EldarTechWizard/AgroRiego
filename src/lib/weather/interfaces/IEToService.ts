import { EToResult } from "../types";
import { IEToCalculator } from "./IEToCalculator";
import { IWeatherProvider } from "./IWeatherProvider";


export interface IEToService {
  getETo(latitude: number, longitude: number, date?: Date): Promise<EToResult>;
  setWeatherProvider(provider: IWeatherProvider): void;
  setEToCalculator(calculator: IEToCalculator): void;
}