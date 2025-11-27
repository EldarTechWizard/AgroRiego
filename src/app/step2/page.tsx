"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import SoilAndAreaForm from "@/components/forms/SoilAndAreaForm"
import WeatherForm from "@/components/forms/WeatherForm"
import { useFarmActions, useFarmData } from "@/stores/farmStore"


export default function Step2Page() {
  const [currentStep, setCurrentStep] = useState(1)


  const router = useRouter()
  const progress = (currentStep / 2) * 100

  const { setSoilType, setWaterFactor, setDepthRoots, setArea, setEt0} = useFarmActions();
  const {selectedSoilType, selectedCrop, area, waterFactor, depthRoots, Et0 } = useFarmData();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Datos completos:", { selectedSoilType, area, depthRoots, waterFactor, Et0})
    router.push("/results")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Paso {currentStep} de 2</span>
              <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStep === 1 && (
            <SoilAndAreaForm
              selectedCrop={selectedCrop}
              soilType={selectedSoilType}
              setSoilType={setSoilType}
              area={area}
              setArea={setArea}
              rootDepth={depthRoots}
              setRootDepth={setDepthRoots}
              waterFactor={waterFactor}
              setWaterFactor={setWaterFactor}
              handleNext={() => setCurrentStep(2)}
              handleBack={() => router.push("/")}
            />
          )}

          {currentStep === 2 && (
            <WeatherForm
              setEt0={setEt0}
              handleBack={() => setCurrentStep(1)}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
