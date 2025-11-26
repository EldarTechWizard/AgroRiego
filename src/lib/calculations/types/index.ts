import { Crop, SoilType } from "@/types/farm";

export type PhenologyResult = {
  cropValue?: string;
  daysSinceSowing: number;
  stage: StageName;
  dayOfStage: number;
  stageLengths: { inicial: number; desarrollo: number; media: number; final?: number | null; total?: number | null };
  stageStartDates: { inicial: Date; desarrollo: Date; media: Date; final?: Date | null; end?: Date | null };
  kcActual: number; // Kc estimado actual (interpolado)
};

export type StageName = "Inicial" | "Desarrollo" | "Media" | "Final" | "Post-cosecha" | "No sembrado" | "Perenne" | "Pre-siembra";

export type StageInfo = {
  stage: StageName;
  dayOfStage: number;
  kcActual: number;
}

export type StageBounds = {
  inicial: { start: number; end: number };
  desarrollo: { start: number; end: number };
  media: { start: number; end: number };
  final: { start: number; end: number } | null;
}

export type CropKc = {
  inicial: number;
  media: number;
  final: number;
  desarrollo?: number;
}

export type IrrigationInputs = {
  crop: Crop;
  soilType: SoilType;
  area: number;
  waterFactor: number;
  depthRoots: number;
  eto: number;
  sowingDate: string;
}

export type IrrigationResults = {
  cultivo: string;
  fechaSiembra: string;
  tipoSuelo: string;
  area: string;
  areaUnit: string;
  laminaNeta: number;
  volumenDiario: number;
  frecuenciaRiego: number;
  proximoRiego: string;
  etapaCultivo: string;
  kcActual: number;
  eto: number;
  // Datos adicionales útiles
  phenology: PhenologyResult;
  CAU: number;
  laminaDeRiego: number;
}