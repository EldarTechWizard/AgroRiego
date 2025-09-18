// stores/farmStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { FarmStore, FormData, SoilType, Crop } from "../types/farm";

// Estado inicial
const initialFormData: FormData = {
  selectedSoilType: null,
  selectedCrop: null,
  sowingDate: "",
  waterFactor: 0,
  area: 0,
  depthRoots: 0,
  Et0: 0,
};

export const useFarmStore = create<FarmStore>()(
  persist(
    (set, get) => ({
      // === ESTADO ===
      formData: initialFormData,

      // === ACCIONES PARA MODIFICAR DATOS ===
      setSoilType: (soilType: SoilType) =>
        set((state) => ({
          formData: {
            ...state.formData,
            selectedSoilType: soilType,
          },
        })),

      setCrop: (crop: Crop) =>
        set((state) => ({
          formData: {
            ...state.formData,
            selectedCrop: crop,
          },
        })),

      setArea: (area: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            area: Math.max(0, area),
          },
        })),

      setSowingDate: (date: string) =>
        set((state) => ({
          formData: {
            ...state.formData,
            sowingDate: date,
          },
        })),

      setDepthRoots: (depth: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            depthRoots: Math.max(0, depth),
          },
        })),
      setWaterFactor: (waterFactor: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            waterFactor: Math.max(0, waterFactor),
          },
        })),

      setEt0: (et0: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            Et0: Math.max(0, et0),
          },
        })),

      updateFormData: (updates: Partial<FormData>) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...updates,
          },
        })),

      setFormData: (newFormData: FormData) =>
        set({
          formData: newFormData,
        }),

      resetForm: () =>
        set({
          formData: initialFormData,
        }),

      // === ACCIONES DERIVADAS ===
      incrementArea: (amount: number = 1) =>
        set((state) => ({
          formData: {
            ...state.formData,
            area: state.formData.area + amount,
          },
        })),

      decrementArea: (amount: number = 1) =>
        set((state) => ({
          formData: {
            ...state.formData,
            area: Math.max(0, state.formData.area - amount),
          },
        })),

      // === GETTERS/SELECTORES ===
      isFormComplete: (): boolean => {
        const { formData } = get();
        return (
          formData.selectedSoilType !== null &&
          formData.selectedCrop !== null &&
          formData.area > 0 &&
          formData.depthRoots > 0 &&
          formData.Et0 > 0
        );
      },

      getCompletionPercentage: (): number => {
        const { formData } = get();
        const fields = [
          formData.selectedSoilType !== null,
          formData.selectedCrop !== null,
          formData.area > 0,
          formData.depthRoots > 0,
          formData.Et0 > 0,
        ];
        const completed = fields.filter(Boolean).length;
        return Math.round((completed / fields.length) * 100);
      },
    }),
    {
      name: "farm-storage",
      partialize: (state) => ({ formData: state.formData }),
      skipHydration: true,
    }
  )
);

// === HOOKS PERSONALIZADOS CON TIPOS ===

// Hook para solo obtener datos
export const useFarmData = (): FormData => {
  return useFarmStore((state) => state.formData);
};

// Hook para solo obtener acciones
export const useFarmActions = () => {
  return useFarmStore(
    useShallow((state) => ({
      setSoilType: state.setSoilType,
      setWaterFactor: state.setWaterFactor,
      setSowingDate: state.setSowingDate,
      setCrop: state.setCrop,
      setArea: state.setArea,
      setDepthRoots: state.setDepthRoots,
      setEt0: state.setEt0,
      updateFormData: state.updateFormData,
      setFormData: state.setFormData,
      resetForm: state.resetForm,
      incrementArea: state.incrementArea,
      decrementArea: state.decrementArea,
    }))
  );
};

// Hook para selectores computados
export const useFarmSelectors = () => {
  return useFarmStore((state) => ({
    isFormComplete: state.isFormComplete(),
    completionPercentage: state.getCompletionPercentage(),
  }));
};

// === SELECTORES ESPECÍFICOS ===

// Selector para el tipo de suelo seleccionado
export const useSelectedSoilType = (): SoilType | null => {
  return useFarmStore((state) => state.formData.selectedSoilType);
};

// Selector para el cultivo seleccionado
export const useSelectedCrop = (): Crop | null => {
  return useFarmStore((state) => state.formData.selectedCrop);
};

// Selector para el área de riego
export const useArea = (): number => {
  return useFarmStore((state) => state.formData.area);
};

// Selector para profundidad de raíces
export const useDepthRoots = (): number => {
  return useFarmStore((state) => state.formData.depthRoots);
};

// Selector para Et0
export const useEt0 = (): number => {
  return useFarmStore((state) => state.formData.Et0);
};
