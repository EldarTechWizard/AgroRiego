import { EToServiceFactory } from "@/lib/weather/services/EtoServiceFactory"
import { ManualWeatherInput } from "@/lib/weather/providers/ManualDataProviders"
import { Provider } from "@/lib/weather/config/weatherConfig"

export type WeatherSource = "openweathermap" | "visual-crossing" | "weather-api" | "manual"

export interface WeatherApiKeys {
  openWeatherMap?: string
  visualCrossing?: string
  weatherAPI?: string
}

export interface WeatherServiceConfig {
  weatherSource: WeatherSource
  apiKeys: WeatherApiKeys
  location: {
    latitude: number
    longitude: number
  }
  manualData?: ManualWeatherInput
  date?: Date
  retryAttempts?: number
  timeoutMs?: number
}

export interface EToResult {
  eto: number
  date: Date
  location: {
    latitude: number
    longitude: number
  }
  source: WeatherSource
  rawData?: any
}

export class WeatherService {
  /**
   * Obtiene la evapotranspiración (ETo) según la fuente de datos configurada
   */
  static async getETo(config: WeatherServiceConfig): Promise<EToResult> {
    const {
      weatherSource,
      apiKeys,
      location,
      manualData,
      date = new Date(),
      retryAttempts = 5,
      timeoutMs = 2000
    } = config

    // Configuración base del servicio
    const baseConfig = {
      primaryProvider: "openweathermap" as Provider,
      apiKeys: {
        openWeatherMap: apiKeys.openWeatherMap,
        visualCrossing: apiKeys.visualCrossing,
        weatherAPI: apiKeys.weatherAPI,
      },
      retryAttempts,
      timeoutMs,
      defaultCalculator: "penman-monteith" as const
    }

    // Crear el servicio según la fuente
    let service

    switch (weatherSource) {
      case "openweathermap":
        service = EToServiceFactory.create({
          ...baseConfig,
          primaryProvider: "openweathermap" as const,
        })
        break

      case "visual-crossing":
        service = EToServiceFactory.create({
          ...baseConfig,
          primaryProvider: "visual-crossing" as const,
        })
        break

      case "weather-api":
        service = EToServiceFactory.create({
          ...baseConfig,
          primaryProvider: "weather-api" as const,
        })
        break

      case "manual":
        if (!manualData) {
          throw new Error("Se requieren datos manuales cuando la fuente es 'manual'")
        }
        service = EToServiceFactory.createWithManualData(
          manualData,
          location.latitude,
          location.longitude,
          "penman-monteith"
        )
        break

      default:
        throw new Error(`Fuente de datos no reconocida: ${weatherSource}`)
    }

    // Obtener ETo
    try {
      const result = await service.getETo(location.latitude, location.longitude, date)

      return {
        eto: result.eto,
        date,
        location,
        source: weatherSource,
        rawData: result
      }
    } catch (error) {
      console.error(`Error obteniendo ETo de ${weatherSource}:`, error)
      throw new Error(`No se pudo obtener ETo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Valida que la configuración sea correcta
   */
  static validateConfig(config: WeatherServiceConfig): string[] {
    const errors: string[] = []

    // Validar ubicación
    if (!config.location) {
      errors.push("Se requiere una ubicación")
    } else {
      if (config.location.latitude < -90 || config.location.latitude > 90) {
        errors.push("La latitud debe estar entre -90 y 90")
      }
      if (config.location.longitude < -180 || config.location.longitude > 180) {
        errors.push("La longitud debe estar entre -180 y 180")
      }
    }

    // Validar API keys según la fuente
    if (config.weatherSource !== "manual") {
      const requiredKey = this.getRequiredApiKey(config.weatherSource)
      if (requiredKey && !config.apiKeys[requiredKey]) {
        errors.push(`Se requiere API key para ${config.weatherSource}`)
      }
    }

    // Validar datos manuales
    if (config.weatherSource === "manual" && !config.manualData) {
      errors.push("Se requieren datos manuales cuando la fuente es 'manual'")
    }

    return errors
  }

  /**
   * Obtiene el nombre de la API key requerida según la fuente
   */
  private static getRequiredApiKey(source: WeatherSource): keyof WeatherApiKeys | null {
    switch (source) {
      case "openweathermap":
        return "openWeatherMap"
      case "visual-crossing":
        return "visualCrossing"
      case "weather-api":
        return "weatherAPI"
      default:
        return null
    }
  }

  /**
   * Crea una configuración por defecto
   */
  static createDefaultConfig(
    location: { latitude: number; longitude: number },
    weatherSource: WeatherSource = "openweathermap"
  ): WeatherServiceConfig {
    return {
      weatherSource,
      apiKeys: {},
      location,
      retryAttempts: 5,
      timeoutMs: 2000
    }
  }
}

export const weatherService = WeatherService