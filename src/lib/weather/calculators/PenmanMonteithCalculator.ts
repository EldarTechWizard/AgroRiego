import { IEToCalculator } from "../interfaces/IEToCalculator";
import { WeatherData } from "../types";

export class PenmanMonteithCalculator implements IEToCalculator {
  calculateETo(data: WeatherData): number {
    const {
      temperatureMax: Tmax,
      temperatureMin: Tmin,
      humidity,
      windSpeed: u2,
      location,
    } = data;
    const Tmean = (Tmax + Tmin) / 2;

    // Validaciones
    if (Tmax < Tmin) {
      throw new Error(
        "Temperatura máxima no puede ser menor que temperatura mínima"
      );
    }

    if (humidity < 0 || humidity > 100) {
      throw new Error("Humedad relativa debe estar entre 0 y 100%");
    }

    if (u2 < 0) {
      throw new Error("Velocidad del viento no puede ser negativa");
    }

    // Constantes
    const altitude = 0; // Se podría parametrizar según ubicación
    const P = 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);
    const gamma = 0.665 * P;

    // Presiones de vapor
    const esTmax = 0.6108 * Math.exp((17.27 * Tmax) / (Tmax + 237.3));
    const esTmin = 0.6108 * Math.exp((17.27 * Tmin) / (Tmin + 237.3));
    const es = (esTmax + esTmin) / 2;
    const ea = es * (humidity / 100);

    // Pendiente de la curva
    const delta =
      (4098 * (0.6108 * Math.exp((17.27 * Tmean) / (Tmean + 237.3)))) /
      Math.pow(Tmean + 237.3, 2);

    // Radiación
    const Rs =
      data.solarRadiation ||
      this.estimateSolarRadiation(location.latitude, data.date);
    const Rn = this.calculateNetRadiation(Rs, Tmax, Tmin, ea);
    const G = 0; // Flujo de calor del suelo ≈ 0 para cálculos diarios

    console.log(Rs);
    // Fórmula Penman-Monteith
    const numerator =
      0.408 * delta * (Rn - G) + gamma * (900 / (Tmean + 273)) * u2 * (es - ea);
    const denominator = delta + gamma * (1 + 0.34 * u2);

    const ETo = numerator / denominator;

    // Validar resultado
    if (ETo < 0) {
      console.warn("ETo calculado es negativo, ajustando a 0");
      return 0;
    }

    if (ETo > 20) {
      console.warn(
        `ETo muy alto: ${ETo.toFixed(2)} mm/día. Verificar datos de entrada.`
      );
    }

    return Math.round(ETo * 100) / 100;
  }

  private estimateSolarRadiation(latitude: number, date: Date): number {
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );

    // Radiación extraterrestre
    const dr = 1 + 0.033 * Math.cos(((2 * Math.PI) / 365) * dayOfYear);
    const delta_rad =
      0.409 * Math.sin(((2 * Math.PI) / 365) * dayOfYear - 1.39);
    const lat_rad = (Math.PI / 180) * latitude;
    const ws = Math.acos(-Math.tan(lat_rad) * Math.tan(delta_rad));

    const Ra =
      ((24 * 60) / Math.PI) *
      0.082 *
      dr *
      (ws * Math.sin(lat_rad) * Math.sin(delta_rad) +
        Math.cos(lat_rad) * Math.cos(delta_rad) * Math.sin(ws));

    // Estimación de radiación solar (asumiendo cielos parcialmente nublados)
    return Ra * 0.5; // Factor de claridad promedio
  }

  private calculateNetRadiation(
    Rs: number,
    Tmax: number,
    Tmin: number,
    ea: number
  ): number {
    // Radiación neta de onda corta
    const albedo = 0.23; // Albedo para pasto de referencia
    const Rns = (1 - albedo) * Rs;

    // Radiación neta de onda larga
    const stefanBoltzmann = 4.903e-9;
    const Rnl =
      ((stefanBoltzmann *
        (Math.pow(Tmax + 273.16, 4) + Math.pow(Tmin + 273.16, 4))) /
        2) *
      (0.34 - 0.14 * Math.sqrt(ea)) *
      (1.35 * Math.min(Rs / (Rs * 0.75), 1.35) - 0.35);

    return Rns - Rnl;
  }

  getMethod(): string {
    return "Penman-Monteith FAO-56";
  }
}
