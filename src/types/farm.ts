export interface CropKc {
  inicial: number;
  desarrollo: number;
  media: number;
  final: number;
}

export interface CropRootDepth {
  min: number;
  max: number;
}

export interface CropP {
  min: number;
  max: number;
}

export interface Crop {
  name: string;
  value: string;
  emoji: string;
  Kc: CropKc;
  rootDepth: CropRootDepth;
  p: CropP;
}


export interface SoilType {
  value: string;
  label: string;
  emoji: string;
  description: string;
  CC: number;  // Capacidad de Campo (%)
  PMP: number; // Punto de Marchitez Permanente (%)
  Da: number;  // Densidad Aparente (g/cm³)
}


export interface FormData {
  selectedSoilType: SoilType | null;
  sowingDate: string;
  selectedCrop: Crop | null;
  area: number;
  waterFactor: number;
  depthRoots: number;
  Et0: number;
}


export interface FarmStore {
  formData: FormData;

  // Acciones para modificar datos
  setSoilType: (soilType: SoilType) => void;
  setCrop: (crop: Crop) => void;
  setArea: (area: number) => void;
  setSowingDate: (date: string) => void;
  setDepthRoots: (depth: number) => void;
  setWaterFactor: (waterFactor: number) => void;
  setEt0: (et0: number) => void;
  updateFormData: (updates: Partial<FormData>) => void;
  setFormData: (newFormData: FormData) => void;
  resetForm: () => void;

  // Acciones derivadas
  incrementArea: (amount?: number) => void;
  decrementArea: (amount?: number) => void;

  // Getters/Selectores
  isFormComplete: () => boolean;
  getCompletionPercentage: () => number;
}

export type StageName = "Inicial" | "Desarrollo" | "Media" | "Final" | "Post-cosecha" | "No sembrado" | "Perenne" | "Pre-siembra";

export type PhenologyResult = {
  cropValue?: string;
  daysSinceSowing: number;
  stage: StageName;
  dayOfStage: number;
  stageLengths: { inicial: number; desarrollo: number; media: number; final?: number | null; total?: number | null };
  stageStartDates: { inicial: Date; desarrollo: Date; media: Date; final?: Date | null; end?: Date | null };
  kcActual: number; // Kc estimado actual (interpolado)
};

// === TIPOS HELPER ===
export type CropValue = Crop['value'];
export type SoilTypeValue = SoilType['value'];

// === TIPOS PARA CONSTANTES ===
export type CropsArray = readonly Crop[];
export type SoilTypesArray = readonly SoilType[];