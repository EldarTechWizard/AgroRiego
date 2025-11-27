"use client"

import { ResultsDashboard } from "@/components/results-dashboard"
import { useFarmData } from "@/stores/farmStore"
import { useIrrigationCalculator } from "@/hooks/use-irrigation-calculator"
import { useMemo } from "react"

export default function ResultsPage() {
  const {
    selectedSoilType,
    selectedCrop,
    area,
    waterFactor,
    depthRoots,
    Et0,
    sowingDate
  } = useFarmData()

  // Preparar inputs para el calculador
  const calculatorInputs = useMemo(() => {
    console.log('🔍 Datos del store:', {
      selectedCrop,
      selectedSoilType,
      area,
      waterFactor,
      depthRoots,
      Et0,
      sowingDate
    })

    if (!selectedCrop || !selectedSoilType) {
      console.log('❌ Faltan datos: crop o soilType')
      return undefined
    }

    const inputs = {
      crop: selectedCrop,
      soilType: selectedSoilType,
      area,
      waterFactor,
      depthRoots,
      eto: Et0,
      sowingDate
    }

    console.log('✅ Inputs preparados:', inputs)
    return inputs
  }, [selectedCrop, selectedSoilType, area, waterFactor, depthRoots, Et0, sowingDate])

  // Usar el hook calculador
  const { results, errors, hasErrors } = useIrrigationCalculator(calculatorInputs)

  console.log('📊 Resultados:', results)
  console.log('⚠️ Errores:', errors)
  console.log('❓ HasErrors:', hasErrors)





  // Mostrar resultados
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Calculando resultados...</p>
      </div>
    )
  }

  return <ResultsDashboard {...results} />
}