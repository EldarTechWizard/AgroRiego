'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/auth-context'
import { calculationService } from '@/lib/supabase/service/calculation.service'
import { CalculatedResults } from '@/types/farm'

export function useCalculations(parcelId?: string) {
  const { profile } = useAuth()
  const [calculations, setCalculations] = useState<CalculatedResults[]>([])
  const [latestCalculation, setLatestCalculation] = useState<CalculatedResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar todos los cálculos de una parcela
   */
  const loadCalculations = useCallback(async (pId?: string) => {
    const parcelIdToUse = pId || parcelId
    
    if (!parcelIdToUse) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await calculationService.getCalculationsByParcelId(parcelIdToUse)
      setCalculations(data)
      
      // Establecer el último cálculo
      if (data.length > 0) {
        setLatestCalculation(data[0]) // Ya vienen ordenados por fecha descendente
      } else {
        setLatestCalculation(null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading calculations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [parcelId])

  /**
   * Obtener el último cálculo de una parcela
   */
  const loadLatestCalculation = useCallback(async (pId?: string) => {
    const parcelIdToUse = pId || parcelId
    
    if (!parcelIdToUse) return null

    try {
      const data = await calculationService.getLatestCalculation(parcelIdToUse)
      setLatestCalculation(data)
      return data
    } catch (err: any) {
      console.error('Error loading latest calculation:', err)
      return null
    }
  }, [parcelId])

  /**
   * Crear un nuevo cálculo
   */
  const createCalculation = useCallback(async (
    pId: string,
    calculation: Omit<CalculatedResults, 'id' | 'calculatedAt'>
  ) => {
    try {
      const newCalculation = await calculationService.createCalculation(pId, calculation)
      
      // Actualizar estado local
      setCalculations(prev => [newCalculation, ...prev])
      setLatestCalculation(newCalculation)
      
      return newCalculation
    } catch (err: any) {
      console.error('Error creating calculation:', err)
      throw err
    }
  }, [])

  /**
   * Eliminar todos los cálculos de una parcela
   */
  const deleteCalculationsByParcelId = useCallback(async (pId: string) => {
    try {
      await calculationService.deleteCalculationsByParcelId(pId)
      
      // Limpiar estado local si es la parcela actual
      if (pId === parcelId) {
        setCalculations([])
        setLatestCalculation(null)
      }
    } catch (err: any) {
      console.error('Error deleting calculations:', err)
      throw err
    }
  }, [parcelId])

  /**
   * Eliminar un cálculo específico (si agregas esta función al servicio)
   */
  const deleteCalculation = useCallback(async (calculationId: string) => {
    try {
      // Nota: Necesitarías agregar esta función al servicio
      // await calculationService.deleteCalculation(calculationId)
      
      // Actualizar estado local
      setCalculations(prev => prev.filter(c => c.id !== calculationId))
      
      // Actualizar último cálculo si es necesario
      if (latestCalculation?.id === calculationId) {
        const remaining = calculations.filter(c => c.id !== calculationId)
        setLatestCalculation(remaining[0] || null)
      }
    } catch (err: any) {
      console.error('Error deleting calculation:', err)
      throw err
    }
  }, [calculations, latestCalculation])

  /**
   * Limpiar estado
   */
  const reset = useCallback(() => {
    setCalculations([])
    setLatestCalculation(null)
    setError(null)
    setIsLoading(false)
  }, [])

  // Cargar cálculos al montar o cuando cambie parcelId
  useEffect(() => {
    if (parcelId) {
      loadCalculations()
    }
  }, [parcelId, loadCalculations])

  // Recargar cuando la página vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && parcelId) {
        loadCalculations()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadCalculations, parcelId])

  return {
    calculations,
    latestCalculation,
    isLoading,
    error,
    loadCalculations,
    loadLatestCalculation,
    createCalculation,
    deleteCalculationsByParcelId,
    deleteCalculation,
    reset
  }
}