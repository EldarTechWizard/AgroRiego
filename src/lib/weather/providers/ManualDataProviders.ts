import { IWeatherProvider } from "../interfaces/IWeatherProvider";
import { WeatherData } from "../types";

export interface ManualWeatherInput {
  temperatureMax: number; // °C
  temperatureMin: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  solarRadiation?: number; // MJ/m²/día (opcional)
  eto?: number; // mm/día (opcional - ETo pre-calculado)
}

export class ManualDataProvider implements IWeatherProvider {
  private manualData: ManualWeatherInput;
  private location: { latitude: number; longitude: number };
  private hasDirectETo: boolean;

  constructor(
    manualData: ManualWeatherInput,
    latitude: number,
    longitude: number
  ) {
    this.validateInput(manualData);
    this.manualData = manualData;
    this.location = { latitude, longitude };
    this.hasDirectETo = manualData.eto !== undefined;
  }

  async getWeatherData(
    latitude: number,
    longitude: number,
    date: Date = new Date()
  ): Promise<WeatherData> {
    // Los datos manuales ignoran lat/lon ya que son específicos del usuario
    return {
      date: date,
      temperatureMax: this.manualData.temperatureMax,
      temperatureMin: this.manualData.temperatureMin,
      humidity: this.manualData.humidity,
      windSpeed: this.manualData.windSpeed,
      solarRadiation: this.manualData.solarRadiation,
      location: this.location,
    };
  }

  getName(): string {
    return "Datos Manuales";
  }

  supportsDirectETo(): boolean {
    return this.hasDirectETo;
  }

  getDirectETo(): number {
    if (!this.manualData.eto) {
      throw new Error("ETo manual no proporcionado");
    }
    return this.manualData.eto;
  }

  // Método para actualizar datos sin crear nueva instancia
  updateData(newData: Partial<ManualWeatherInput>): void {
    const updatedData = { ...this.manualData, ...newData };
    this.validateInput(updatedData);
    this.manualData = updatedData;
    this.hasDirectETo = updatedData.eto !== undefined;
  }

  // Obtener los datos actuales
  getCurrentData(): ManualWeatherInput {
    return { ...this.manualData };
  }

  private validateInput(data: ManualWeatherInput): void {
    const { temperatureMax, temperatureMin, humidity, windSpeed } = data;

    if (temperatureMax < temperatureMin) {
      throw new Error(
        "Temperatura máxima no puede ser menor que temperatura mínima"
      );
    }

    if (temperatureMax < -50 || temperatureMax > 60) {
      throw new Error(
        "Temperatura máxima fuera de rango válido (-50°C a 60°C)"
      );
    }

    if (temperatureMin < -50 || temperatureMin > 60) {
      throw new Error(
        "Temperatura mínima fuera de rango válido (-50°C a 60°C)"
      );
    }

    if (humidity < 0 || humidity > 100) {
      throw new Error("Humedad relativa debe estar entre 0 y 100%");
    }

    if (windSpeed < 0 || windSpeed > 50) {
      throw new Error("Velocidad del viento debe estar entre 0 y 50 m/s");
    }

    if (
      data.solarRadiation !== undefined &&
      (data.solarRadiation < 0 || data.solarRadiation > 50)
    ) {
      throw new Error("Radiación solar debe estar entre 0 y 50 MJ/m²/día");
    }

    if (data.eto !== undefined && (data.eto < 0 || data.eto > 20)) {
      throw new Error("ETo debe estar entre 0 y 20 mm/día");
    }
  }
}
