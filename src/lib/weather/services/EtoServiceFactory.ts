import { IEToService } from "../interfaces/IEToService";
import { EToService } from "./EToService";
import { VisualCrossingProvider } from "../providers/VisualCrossingProvider";
import { WeatherAPIProvider } from "../providers/WeatherAPIProvider";
import { OpenWeatherMapProvider } from "../providers/OpenWeatherProvider";
import { PenmanMonteithCalculator } from "../calculators/PenmanMonteithCalculator";
import { HargreavesCalculator } from "../calculators/HargreavesCalculator";
import { WeatherConfig } from "../config/weatherConfig";
import {
  ManualDataProvider,
  ManualWeatherInput,
} from "../providers/ManualDataProviders";

export class EToServiceFactory {
  static create(config: WeatherConfig): IEToService {
    const provider = this.createProvider(
      config.primaryProvider,
      config.apiKeys
    );
    const calculator =
      config.defaultCalculator === "penman-monteith"
        ? new PenmanMonteithCalculator()
        : new HargreavesCalculator();

        console.log(calculator);
    return new EToService(provider, calculator);
  }

  static createWithManualData(
    manualData: ManualWeatherInput,
    latitude: number,
    longitude: number,
    calculatorType: "penman-monteith" | "hargreaves" = "penman-monteith"
  ): IEToService {
    const provider = new ManualDataProvider(manualData, latitude, longitude);
    const calculator =
      calculatorType === "penman-monteith"
        ? new PenmanMonteithCalculator()
        : new HargreavesCalculator();

    return new EToService(provider, calculator);
  }

  static createWithFallback(config: WeatherConfig): IEToService {
    const service = this.create(config);

    // Configurar fallback si está definido
    if (
      config.fallbackProvider &&
      config.fallbackProvider !== config.primaryProvider
    ) {
      const fallbackProvider = this.createProvider(
        config.fallbackProvider,
        config.apiKeys
      );
      (service as EToService).setFallbackProvider(fallbackProvider);
    }

    return service;
  }

  static createManualWithAPIFallback(
    manualData: ManualWeatherInput,
    latitude: number,
    longitude: number,
    config: WeatherConfig
  ): IEToService {
    const manualProvider = new ManualDataProvider(
      manualData,
      latitude,
      longitude
    );
    const apiProvider = this.createProvider(
      config.primaryProvider,
      config.apiKeys
    );

    const calculator =
      config.defaultCalculator === "penman-monteith"
        ? new PenmanMonteithCalculator()
        : new HargreavesCalculator();

    const service = new EToService(manualProvider, calculator);
    (service as EToService).setFallbackProvider(apiProvider);

    return service;
  }

  private static createProvider(providerType: string, apiKeys: any) {
    switch (providerType) {
      case "visual-crossing":
        return new VisualCrossingProvider(apiKeys.visualCrossing);
      case "weather-api":
        return new WeatherAPIProvider(apiKeys.weatherAPI);
      case "openweathermap":
        return new OpenWeatherMapProvider(apiKeys.openWeatherMap);
      default:
        throw new Error(`Proveedor no soportado: ${providerType}`);
    }
  }
}
