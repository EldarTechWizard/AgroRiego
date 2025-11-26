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


export interface Location {
   latitude: number;
    longitude: number;
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

export interface CalculatedResults {
  id: string;
  rootDepth: number;
  waterFactor: number;
  netSheet: number;
  dailyVolume: number;
  irrigationFrequency: number;
  nextIrrigation: string;
  cropStage: string;
  currentKc: number;
  calculatedAt: Date;
  eto: number;
}

export type Parcel = {
  id: string;
  userId: string;
  name: string;
  area: number;
  sowingDate: Date;
  crop: Crop;
  soilType: SoilType;
  createdAt: Date;
  location: Location;
  calculations: CalculatedResults[];
};



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




// === TIPOS HELPER ===
export type CropValue = Crop['value'];
export type SoilTypeValue = SoilType['value'];

// === TIPOS PARA CONSTANTES ===
export type CropsArray = readonly Crop[];
export type SoilTypesArray = readonly SoilType[];