import { IEToCalculator } from "../interfaces/IEToCalculator";
import { WeatherData } from "../types";

export class HargreavesCalculator implements IEToCalculator {
  calculateETo(data: WeatherData): number {
    const { temperatureMax: Tmax, temperatureMin: Tmin, location } = data;
    const Tmean = (Tmax + Tmin) / 2;

    // Validaciones
    if (Tmax < Tmin) {
      throw new Error(
        "Temperatura máxima no puede ser menor que temperatura mínima"
      );
    }

    if (Tmax - Tmin < 0.1) {
      console.warn(
        "Diferencia de temperatura muy pequeña, puede afectar la precisión"
      );
    }

    // Radiación extraterrestre
    const Ra = this.getExtraterrestrialRadiation(location.latitude, data.date);

    // Fórmula Hargreaves-Samani
    const ETo = 0.0023 * (Tmean + 17.8) * Math.sqrt(Tmax - Tmin) * Ra;

    // Validar resultado
    if (ETo < 0) {
      console.warn("ETo calculado es negativo, ajustando a 0");
      return 0;
    }

    if (ETo > 15) {
      console.warn(
        `ETo muy alto con Hargreaves: ${ETo.toFixed(
          2
        )} mm/día. Verificar datos.`
      );
    }

    return Math.round(ETo * 100) / 100;
  }

  private getExtraterrestrialRadiation(latitude: number, date: Date): number {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Constante solar
    const solarConstant = 0.082; // MJ/m²/min

    // Factor de corrección de distancia Tierra-Sol
    const dr = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365) * dayOfYear);

    // Declinación solar
    const delta = 0.409 * Math.sin(((2 * Math.PI) / 365) * dayOfYear - 1.39);

    // Convertir latitud a radianes
    const lat_rad = (Math.PI / 180) * latitude;

    // Ángulo horario al amanecer
    const ws = Math.acos(-Math.tan(lat_rad) * Math.tan(delta));

    // Radiación extraterrestre
    const Ra =
      ((24 * 60) / Math.PI) *
      solarConstant *
      dr *
      (ws * Math.sin(lat_rad) * Math.sin(delta) +
        Math.cos(lat_rad) * Math.cos(delta) * Math.sin(ws));

    return Math.max(Ra, 0.1); // Evitar valores negativos o muy pequeños
  }

  getMethod(): string {
    return "Hargreaves-Samani";
  }
}
