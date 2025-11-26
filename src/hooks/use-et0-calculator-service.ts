import { useState, useCallback } from "react";
import {
  WeatherService,
  WeatherServiceConfig,
  EToResult,
} from "@/lib/calculations/services/et0-calculator.service";

export function useEt0Calculator() {
  const [eto, setEto] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EToResult | null>(null);

  const fetchETo = useCallback(async (config: WeatherServiceConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar configuración
      const validationErrors = WeatherService.validateConfig(config);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      // Obtener ETo
      const etoResult = await WeatherService.getETo(config);

      setEto(etoResult.eto);
      setResult(etoResult);

      return etoResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching ETo:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setEto(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    eto,
    result,
    isLoading,
    error,
    fetchETo,
    reset,
  };
}
