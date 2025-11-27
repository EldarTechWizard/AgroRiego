import { getPhenologicalStage } from "@/lib/calculations/services/phenology-calculator.service";
import { IrrigationInputs, IrrigationResults } from "../types";

export class IrrigationCalculatorService {
  /**
   * Calcula todos los parámetros de riego
   */
  static calculate(inputs: IrrigationInputs): IrrigationResults {
    // 1. Obtener fenología
    const phenology = getPhenologicalStage(inputs.crop, inputs.sowingDate);

    // 2. Calcular lámina neta diaria (mm/día)
    const laminaNeta = phenology.kcActual * inputs.eto;

    // 3. Convertir profundidad de raíces a cm
    const depthRoots_cm = inputs.depthRoots * 100;

    // 4. Calcular Capacidad de Almacenamiento Útil (mm)
    const CAU =
      (inputs.soilType.CC - inputs.soilType.PMP) *
      inputs.soilType.Da *
      depthRoots_cm *
      10;

    // 5. Calcular lámina de riego (mm)
    const laminaDeRiego = CAU * inputs.waterFactor;

    // 6. Calcular frecuencia de riego (días)
    const frecuenciaRiego = laminaDeRiego / laminaNeta;

    // 7. Calcular próximo riego
    const proximoRiego = this.calcularProximoRiego(
      frecuenciaRiego,
      this.parseDateLocal(inputs.sowingDate)
    );

    // 8. Formatear etapa del cultivo
    const etapaCultivo =
      phenology.stage +
      (phenology.stage === "No sembrado"
        ? ""
        : ` (día ${phenology.dayOfStage})`);

    return {
      cultivo: inputs.crop.name,
      fechaSiembra: inputs.sowingDate,
      tipoSuelo: inputs.soilType.value,
      area: inputs.area.toString(),
      areaUnit: "m²",
      laminaNeta,
      volumenDiario: laminaNeta * inputs.area,
      frecuenciaRiego,
      proximoRiego,
      etapaCultivo,
      kcActual: phenology.kcActual,
      eto: inputs.eto,
      // Datos adicionales
      phenology,
      CAU,
      laminaDeRiego,
    };
  }

  /**
   * Calcula la fecha del próximo riego
   */
  private static calcularProximoRiego(
    frecuenciaRiego: number,
    fechaReferencia?: Date
  ): string {
    const baseDate = fechaReferencia ? new Date(fechaReferencia) : new Date();
    const proximo = new Date(baseDate);
    proximo.setDate(proximo.getDate() + Math.round(frecuenciaRiego));

    return proximo.toISOString().split("T")[0]; // ✔ formato válido para Supabase TIMESTAMP
  }

  /**
   * Parsea una fecha en formato YYYY-MM-DD a objeto Date
   */
  private static parseDateLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Valida que los inputs sean correctos
   */
  static validateInputs(inputs: IrrigationInputs): string[] {
    const errors: string[] = [];

    if (!inputs.crop?.name) {
      errors.push("Debe seleccionar un cultivo");
    }

    if (!inputs.soilType?.value) {
      errors.push("Debe seleccionar un tipo de suelo");
    }

    if (inputs.area <= 0) {
      errors.push("El área debe ser mayor a 0");
    }

    if (inputs.waterFactor <= 0 || inputs.waterFactor > 1) {
      errors.push("El factor de agua debe estar entre 0 y 1");
    }

    if (inputs.depthRoots <= 0) {
      errors.push("La profundidad de raíces debe ser mayor a 0");
    }

    if (inputs.eto <= 0) {
      errors.push("La evapotranspiración debe ser mayor a 0");
    }

    if (!inputs.sowingDate) {
      errors.push("Debe especificar una fecha de siembra");
    }

    return errors;
  }
}

export const irrigationCalculator = IrrigationCalculatorService;
