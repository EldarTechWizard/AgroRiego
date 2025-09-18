"use client"

import { useRouter } from "next/navigation"
import { Calendar, ArrowRight, Apple, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { crops } from "@/constants/"
import { useFarmActions, useFarmData } from "@/stores/farmStore"
import { useState, useEffect } from "react"


export function CalculatorCard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const { setCrop, setSowingDate, setDepthRoots, setWaterFactor } = useFarmActions();
  const { selectedCrop, sowingDate } = useFarmData();

  const handleContinue = async () => {
    if (selectedCrop && sowingDate && !isNavigating) {
      setIsNavigating(true) // Activar loading
      console.log("Navegando al step 2 con datos:", { cultivo: selectedCrop, fecha: sowingDate })

      try {
        await router.push("/step2")
      } catch (error) {
        console.error("Error en navegación:", error)
        setIsNavigating(false) // Resetear en caso de error
      }
      // No resetear aquí porque el componente se desmontará
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
              <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Comienza tu cálculo de riego</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Preparando la calculadora de riego...
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-balance">Comienza tu cálculo de riego</h2>
        <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
          Selecciona tu cultivo y fecha de siembra para obtener recomendaciones precisas de riego
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="max-w-4xl mx-auto shadow-xl border-2 border-primary/10">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <Apple className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Calculadora de Riego</CardTitle>
          <CardDescription className="text-base">Ingresa los datos de tu cultivo para comenzar</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Selector de Cultivo */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Apple className="w-4 h-4 text-primary" />
              Selecciona tu cultivo
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2">
              {crops.map((crop) => {
                return (
                  <Card
                    key={crop.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedCrop?.value === crop.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    onClick={() => {
                      setCrop(crop)
                      setDepthRoots(Number(((crop.rootDepth.min + crop.rootDepth.max) / 2).toFixed(1)))
                      setWaterFactor(Number(((crop.p.min + crop.p.max) / 2).toFixed(1)))
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{crop.emoji}</div>
                      <p className="text-sm font-medium">{crop.name}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Fecha de Siembra */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-base font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Fecha de siembra
            </Label>
            <Input
              id="fecha"
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          {/* Botón Continuar */}
          <Button
            onClick={handleContinue}
            disabled={!selectedCrop || !sowingDate || isNavigating}
            className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            size="lg"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Info adicional */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Asegúrate de tener los datos correctos de tu cultivo para obtener los mejores
              resultados en el cálculo de riego.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

