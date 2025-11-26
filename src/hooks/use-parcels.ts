"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { parcelService } from "@/lib/supabase/service/parcel.service";
import { Parcel } from "@/types/farm";

export function useParcels() {
  const { profile } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar parcelas
  const loadParcels = useCallback(async () => {
    if (!profile) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await parcelService.getUserParcels(profile.id);
      setParcels(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading parcels:", err);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  // Crear parcela
  const createParcel = useCallback(
    async (
      name: string,
      partialData?: Partial<Omit<Parcel, "id" | "userId" | "createdAt">>
    ) => {
      if (!profile) throw new Error("Usuario no autenticado");

      const newParcel = await parcelService.createParcel(
        profile.id,
        name,
        partialData
      );
      setParcels((prev) => [newParcel, ...prev]);
      return newParcel;
    },
    [profile]
  );

  // Actualizar parcela
  const updateParcel = useCallback(
    async (
      parcelId: string,
      updates: Partial<Omit<Parcel, "id" | "userId" | "createdAt">>
    ) => {
      if (!profile) throw new Error("Usuario no autenticado");

      const updatedParcel = await parcelService.updateParcel(
        parcelId,
        profile.id,
        updates
      );
      setParcels((prev) =>
        prev.map((p) => (p.id === parcelId ? updatedParcel : p))
      );
      return updatedParcel;
    },
    [profile]
  );

  // Eliminar parcela
  const deleteParcel = useCallback(
    async (parcelId: string) => {
      if (!profile) throw new Error("Usuario no autenticado");

      await parcelService.deleteParcel(parcelId, profile.id);
      setParcels((prev) => prev.filter((p) => p.id !== parcelId));
    },
    [profile]
  );

  // Cargar parcelas al montar
  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && profile) {
        loadParcels();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadParcels, profile]);

  return {
    parcels,
    isLoading,
    error,
    loadParcels,
    createParcel,
    updateParcel,
    deleteParcel,
  };
}
