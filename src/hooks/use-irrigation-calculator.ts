import { IrrigationCalculatorService } from "@/lib/calculations/services/irrigation-calculator.service";
import { IrrigationInputs, IrrigationResults } from "@/lib/calculations/types";
import { useState, useCallback, useMemo, useEffect } from "react";

export function useIrrigationCalculator(inputs?: IrrigationInputs) {
  const [results, setResults] = useState<IrrigationResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Calcular resultados
  const calculate = useCallback(
    (newInputs?: IrrigationInputs) => {
      const inputsToUse = newInputs || inputs;

      if (!inputsToUse) {
        setErrors(["No hay datos de entrada"]);
        setResults(null);
        return null;
      }

      // Validar inputs
      const validationErrors =
        IrrigationCalculatorService.validateInputs(inputsToUse);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setResults(null);
        return null;
      }

      // Calcular
      try {
        const calculatedResults =
          IrrigationCalculatorService.calculate(inputsToUse);
        setResults(calculatedResults);
        setErrors([]);
        return calculatedResults;
      } catch (error) {
        console.error("Error calculating irrigation:", error);
        setErrors(["Error al calcular los resultados"]);
        setResults(null);
        return null;
      }
    },
    [inputs]
  );

  // Auto-calcular cuando los inputs cambien
  useEffect(() => {
    if (!inputs) {
      setResults(null);
      setErrors([]);
      return;
    }

    const validationErrors = IrrigationCalculatorService.validateInputs(inputs);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    try {
      const calculatedResults = IrrigationCalculatorService.calculate(inputs);
      setResults(calculatedResults);
      setErrors([]);
    } catch (error) {
      console.error("Error calculating irrigation:", error);
      setErrors(["Error al calcular los resultados"]);
      setResults(null);
    }
  }, [inputs]);

  return {
    results,
    errors,
    calculate,
    hasErrors: errors.length > 0,
  };
}
