import { IEToService } from "../interfaces/IEToService";
import { IWeatherProvider } from "../interfaces/IWeatherProvider";
import { IEToCalculator } from "../interfaces/IEToCalculator";
import { EToResult } from "../types/EToResult";
import { VisualCrossingProvider } from "../providers/VisualCrossingProvider";

export class EToService implements IEToService {
  private fallbackProvider?: IWeatherProvider;

  constructor(
    private weatherProvider: IWeatherProvider,
    private etoCalculator: IEToCalculator
  ) {}

  async getETo(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<EToResult> {
    try {
      return await this.tryGetETo(
        this.weatherProvider,
        latitude,
        longitude,
        date
      );
    } catch (error) {
      // Intentar con provider de fallback si está configurado
      if (this.fallbackProvider) {
        console.warn(
          `Fallo proveedor principal (${this.weatherProvider.getName()}), intentando con fallback (${this.fallbackProvider.getName()})`
        );
        try {
          return await this.tryGetETo(
            this.fallbackProvider,
            latitude,
            longitude,
            date
          );
        } catch (fallbackError) {
          throw new Error(
            `Fallaron ambos proveedores. Principal: ${error}. Fallback: ${fallbackError}`
          );
        }
      }
      throw error;
    }
  }

  private async tryGetETo(
    provider: IWeatherProvider,
    latitude: number,
    longitude: number,
    date: Date
  ): Promise<EToResult> {
    const weatherData = await provider.getWeatherData(
      latitude,
      longitude,
      date
    );

    let eto: number;
    let method: "direct" | "calculated";

    // Si el proveedor soporta ETo directo y es Visual Crossing, intentar obtenerlo
    if (
      provider.supportsDirectETo() &&
      provider instanceof VisualCrossingProvider
    ) {
      try {
        eto = await provider.getDirectETo(latitude, longitude, date);
        method = "direct";
      } catch (directEtoError) {
        console.warn(`Fallo ETo directo, calculando: ${directEtoError}`);
        eto = this.etoCalculator.calculateETo(weatherData);
        method = "calculated";
      }
    } else {
      eto = this.etoCalculator.calculateETo(weatherData);
      method = "calculated";
    }

    return {
      eto,
      method,
      source: provider.getName(),
      calculatedAt: new Date(),
      weatherData,
    };
  }

  setWeatherProvider(provider: IWeatherProvider): void {
    this.weatherProvider = provider;
  }

  setEToCalculator(calculator: IEToCalculator): void {
    this.etoCalculator = calculator;
  }

  setFallbackProvider(provider: IWeatherProvider): void {
    this.fallbackProvider = provider;
  }

  getFallbackProvider(): IWeatherProvider | undefined {
    return this.fallbackProvider;
  }

  getCurrentProvider(): IWeatherProvider {
    return this.weatherProvider;
  }

  getCurrentCalculator(): IEToCalculator {
    return this.etoCalculator;
  }
}
