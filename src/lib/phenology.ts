import { Crop, PhenologyResult, StageName } from "@/types/farm";
import { STAGE_DURATIONS } from "@/constants";

// Tipos internos para mejor tipado
interface StageInfo {
  stage: StageName;
  dayOfStage: number;
  kcActual: number;
}

interface StageBounds {
  inicial: { start: number; end: number };
  desarrollo: { start: number; end: number };
  media: { start: number; end: number };
  final: { start: number; end: number } | null;
}

interface CropKc {
  inicial: number;
  media: number;
  final: number;
  desarrollo?: number;
}




// Constantes
const FALLBACK_DURATIONS = {
  inicial: 20,
  desarrollo: 40,
  media: 40,
  final: 20,
} as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convierte una fecha a medianoche UTC para cálculos consistentes
 */
function toUTCMidnight(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Calcula los días entre dos fechas
 */
function daysBetween(startDate: Date, endDate: Date): number {
  const startUTC = toUTCMidnight(startDate);
  const endUTC = toUTCMidnight(endDate);
  return Math.floor((endUTC - startUTC) / MS_PER_DAY);
}

/**
 * Parsea una fecha en formato string local (YYYY-MM-DD)
 */
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
  
  return new Date(year, month - 1, day); // mes base 0
}

/**
 * Normaliza una fecha desde string o Date
 */
function normalizeDate(date: Date | string): Date {
  if (typeof date === "string") {
    return parseDateLocal(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Fecha inválida proporcionada");
  }
  
  return date;
}

/**
 * Interpola Kc durante las etapas de desarrollo y final según FAO (interpolación lineal)
 */
function computeKcForStage(
  cropKc: CropKc,
  stage: StageName,
  dayOfStage: number,
  stageLength: number
): number {
  if (!cropKc) return NaN;

  const { inicial, media, final } = cropKc;

  switch (stage) {
    case "Inicial":
      return inicial;

    case "Desarrollo":
      if (stageLength <= 1) return media;
      const developmentRatio = Math.max(0, Math.min(1, (dayOfStage - 1) / (stageLength - 1)));
      return inicial + developmentRatio * (media - inicial);

    case "Media":
      return media;

    case "Final":
      if (stageLength <= 1) return final ?? media;
      const finalRatio = Math.max(0, Math.min(1, (dayOfStage - 1) / (stageLength - 1)));
      return media + finalRatio * ((final ?? media) - media);

    case "Perenne":
    case "Post-cosecha":
    default:
      return media ?? inicial;
  }
}

/**
 * Calcula los límites de cada etapa fenológica
 */
function calculateStageBounds(
  Lini: number,
  Ldev: number,
  Lmid: number,
  Lfin: number | null
): StageBounds {
  const inicial = { start: 0, end: Lini };
  const desarrollo = { start: inicial.end, end: inicial.end + Ldev };
  const media = { start: desarrollo.end, end: desarrollo.end + Lmid };
  const final = Lfin !== null 
    ? { start: media.end, end: media.end + Lfin }
    : null;

  return { inicial, desarrollo, media, final };
}

/**
 * Determina la etapa fenológica actual basada en los días transcurridos desde la siembra
 */
function determineCurrentStage(
  daysSinceSow: number,
  bounds: StageBounds,
  selectedCropObject: Crop,
  stageLengths: { Lini: number; Ldev: number; Lmid: number; Lfin: number | null }
): StageInfo {
  const { Lini, Ldev, Lmid, Lfin } = stageLengths;

  // Inicial
  if (daysSinceSow < bounds.inicial.end) {
    return {
      stage: "Inicial",
      dayOfStage: daysSinceSow + 1,
      kcActual: computeKcForStage(selectedCropObject.Kc, "Inicial", daysSinceSow + 1, Lini)
    };
  }

  // Desarrollo
  if (daysSinceSow < bounds.desarrollo.end) {
    const dayOfStage = daysSinceSow - bounds.desarrollo.start + 1;
    return {
      stage: "Desarrollo",
      dayOfStage,
      kcActual: computeKcForStage(selectedCropObject.Kc, "Desarrollo", dayOfStage, Ldev)
    };
  }

  // Media
  if (daysSinceSow < bounds.media.end) {
    const dayOfStage = daysSinceSow - bounds.media.start + 1;
    return {
      stage: "Media",
      dayOfStage,
      kcActual: computeKcForStage(selectedCropObject.Kc, "Media", dayOfStage, Lmid)
    };
  }

  // Final o Post-cosecha
  if (bounds.final && daysSinceSow < bounds.final.end) {
    const dayOfStage = daysSinceSow - bounds.final.start + 1;
    return {
      stage: "Final",
      dayOfStage,
      kcActual: computeKcForStage(selectedCropObject.Kc, "Final", dayOfStage, Lfin!)
    };
  }

  // Cultivo perenne (sin etapa final)
  if (!bounds.final) {
    const dayOfStage = daysSinceSow - bounds.media.start + 1;
    return {
      stage: "Perenne",
      dayOfStage,
      kcActual: computeKcForStage(selectedCropObject.Kc, "Media", dayOfStage, Lmid)
    };
  }

  // Post-cosecha
  const dayOfStage = daysSinceSow - bounds.final.end + 1;
  return {
    stage: "Post-cosecha",
    dayOfStage,
    kcActual: computeKcForStage(selectedCropObject.Kc, "Final", Lfin!, Lfin!)
  };
}

/**
 * Crea una fecha agregando días a una fecha base
 */
function addDays(baseDate: Date, offsetDays: number): Date {
  const newDate = new Date(baseDate);
  newDate.setDate(newDate.getDate() + offsetDays);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Calcula las fechas de inicio de cada etapa
 */
function calculateStageStartDates(sowingDate: Date, bounds: StageBounds) {
  return {
    inicial: addDays(sowingDate, bounds.inicial.start),
    desarrollo: addDays(sowingDate, bounds.desarrollo.start),
    media: addDays(sowingDate, bounds.media.start),
    final: bounds.final ? addDays(sowingDate, bounds.final.start) : null,
    end: bounds.final ? addDays(sowingDate, bounds.final.end) : null,
  };
}

/**
 * Obtiene las duraciones de etapa para un cultivo, con fallback
 */
function getStageDurations(cropValue?: string) {
  if (!cropValue || !STAGE_DURATIONS[cropValue]) {
    console.warn(`No se encontraron duraciones para el cultivo: ${cropValue}. Usando valores por defecto.`);
    return FALLBACK_DURATIONS;
  }
  
  return STAGE_DURATIONS[cropValue];
}

/**
 * Retorna un resultado por defecto cuando no hay cultivo seleccionado o fecha inválida
 */
function getDefaultResult(
  cropValue?: string, 
  sowingDate?: Date, 
  daysSinceSowing = 0,
  cropObject?: Crop | null
): PhenologyResult {
  const defaultDate = sowingDate || new Date();
  
  // Para fechas pre-siembra, usar Kc inicial si está disponible
  let kcDefault = NaN;
  if (daysSinceSowing < 0 && cropObject?.Kc?.inicial) {
    kcDefault = cropObject.Kc.inicial;
  }
  
  return {
    cropValue: cropValue || undefined,
    daysSinceSowing,
    stage: daysSinceSowing < 0 ? "Pre-siembra" : "No sembrado",
    dayOfStage: Math.abs(daysSinceSowing), // Días hasta la siembra si es negativo
    stageLengths: { inicial: 0, desarrollo: 0, media: 0, final: 0 },
    stageStartDates: {
      inicial: defaultDate,
      desarrollo: defaultDate,
      media: defaultDate,
      final: defaultDate,
      end: defaultDate,
    },
    kcActual: kcDefault,
  };
}

/**
 * Función principal que calcula la etapa fenológica de un cultivo
 * @param selectedCropObject - Objeto del cultivo seleccionado
 * @param sowingDate - Fecha de siembra
 * @param targetDate - Fecha objetivo para calcular la etapa (por defecto: fecha actual)
 * @returns Resultado con información de la etapa fenológica
 */
export function getPhenologicalStage(
  selectedCropObject: Crop | undefined | null,
  sowingDate: Date | string,
  targetDate: Date | string = new Date()
): PhenologyResult {
  try {
    // Validaciones iniciales
    if (!selectedCropObject) {
      return getDefaultResult();
    }

    const sowDate = normalizeDate(sowingDate);
    const targetDateNormalized = normalizeDate(targetDate);
    const daysSinceSow = daysBetween(sowDate, targetDateNormalized);

    // Si la fecha objetivo es anterior a la siembra
    if (daysSinceSow < 0) {
      return getDefaultResult(selectedCropObject.value, sowDate, daysSinceSow, selectedCropObject);
    }

    // Obtener duraciones de etapas
    const durations = getStageDurations(selectedCropObject.value);
    const { inicial: Lini, desarrollo: Ldev, media: Lmid, final: Lfin } = durations;

    // Calcular límites de etapas
    const bounds = calculateStageBounds(Lini, Ldev, Lmid, Lfin ?? null);

    // Determinar etapa actual
    const stageInfo = determineCurrentStage(
      daysSinceSow, 
      bounds, 
      selectedCropObject,
      { Lini, Ldev, Lmid, Lfin: Lfin ?? null }
    );

    // Calcular fechas de inicio
    const stageStartDates = calculateStageStartDates(sowDate, bounds);

    // Calcular duración total
    const totalDuration = Lfin !== null && Lfin !== undefined ? Lini + Ldev + Lmid + Lfin : Lini + Ldev + Lmid;

    return {
      cropValue: selectedCropObject.value,
      daysSinceSowing: daysSinceSow,
      stage: stageInfo.stage,
      dayOfStage: stageInfo.dayOfStage,
      stageLengths: {
        inicial: Lini,
        desarrollo: Ldev,
        media: Lmid,
        final: Lfin,
        total: totalDuration,
      },
      stageStartDates,
      kcActual: Math.round((stageInfo.kcActual + Number.EPSILON) * 100) / 100,
    };

  } catch (error) {
    console.error("Error al calcular etapa fenológica:", error);
    return getDefaultResult(selectedCropObject?.value, undefined, 0, selectedCropObject);
  }
}