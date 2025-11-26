"use client"

import type React from "react"

import { ChangeEvent, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Cloud, Settings, Edit3, Loader2, ChevronLeft, Check, Key } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { Parcel, CalculatedResults } from "@/types/farm"
import { crops } from "@/constants/index"
import { useEt0Calculator } from "@/hooks/use-et0-calculator-service"
import { WeatherSource } from "@/lib/calculations/services/et0-calculator.service"
import { ManualWeatherInput } from "@/lib/weather/providers/ManualDataProviders"
import { IrrigationInputs } from "@/lib/calculations/types"
import { irrigationCalculator } from "@/lib/calculations/services/irrigation-calculator.service"
import { useCalculations } from "@/hooks/use-calculations"

interface NewCalculationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parcel: Parcel
  onCalculationSave: () => void
}


export function NewCalculationDialog({ open, onOpenChange, parcel, onCalculationSave }: Readonly<NewCalculationDialogProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [weatherSource, setWeatherSource] = useState<WeatherSource>("visual-crossing")
  const { fetchETo } = useEt0Calculator()
  const { createCalculation } = useCalculations()

  const [apiKeys, setApiKeys] = useState({
    visualCrossing: "",
    weatherAPI: "",
    openWeatherMap: "",
  })

  const [manualData, setManualData] = useState<ManualWeatherInput>({
    temperatureMax: 0,        // °C
    temperatureMin: 0,        // °C
    humidity: 0,       // % HR media
    windSpeed: 0,      // m/s a 2m
    solarRadiation: 0, // MJ/m²/día
  })
  const [manualDataInput, setManualDataInput] = useState({
    temperatureMax: "",
    temperatureMin: "",
    humidity: "",
    windSpeed: "",
    solarRadiation: "",
    evapotranspiration: "",
  })

  const selectedCropData = crops.find((c) => c.value === parcel.crop.value)
  const [rootDepth, setRootDepth] = useState<number>(selectedCropData?.rootDepth.min || 0.6)
  const [waterFactor, setWaterFactor] = useState<number>(selectedCropData?.p.min || 0.4)

  const onChangeManualData = (field: keyof ManualWeatherInput) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Actualiza el input visible
    setManualDataInput(prev => ({
      ...prev,
      [field]: value,
    }));

    // Convierte a número o 0 si está vacío
    const numeric = value === "" ? 0 : Number(value);
    if (!Number.isNaN(numeric)) {
      setManualData(prev => ({
        ...prev,
        [field]: numeric,
      }));
    }
  };

  const OnClickHandleCalculations = async () => {
    try {
      setIsSubmitting(true)
      const location = parcel.location
      const et0Result = await fetchETo({
        weatherSource,
        apiKeys,
        location,
        manualData: weatherSource === "manual" ? manualData : undefined
      })

      const inputs: IrrigationInputs = {
        crop: parcel.crop,
        soilType: parcel.soilType,
        area: parcel.area,
        waterFactor: waterFactor,
        depthRoots: rootDepth,
        eto: et0Result.eto,
        sowingDate: parcel.sowingDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
      }

      // Validar inputs
      const validationErrors = irrigationCalculator.validateInputs(inputs)
      if (validationErrors.length > 0) {
        console.error('Errores de validación:', validationErrors)
        // Mostrar errores al usuario
        alert(validationErrors.join('\n'))
        return
      }

      // Calcular resultados
      const results = irrigationCalculator.calculate(inputs)
      console.log('Resultados:', results)

      // Aquí puedes guardar los resultados en Supabase
      await createCalculation(parcel.id, {
        netSheet: results.laminaDeRiego,
        dailyVolume: results.volumenDiario,
        irrigationFrequency: results.frecuenciaRiego,
        nextIrrigation: results.proximoRiego,
        cropStage: results.phenology.stage,
        currentKc: results.kcActual,
        eto: results.eto,
        waterFactor: waterFactor,
        rootDepth: rootDepth
      })

      // Mostrar éxito al usuario
      console.log('¡Cálculo realizado con éxito!')

      onCalculationSave()

      onOpenChange(false)

      setCurrentStep(0)

    } catch (err) {
      console.error('Error en cálculo:', err)
      alert('Error al realizar el cálculo')
    } finally {
      setIsSubmitting(false)
    }
  }



  if (!selectedCropData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Nuevo Cálculo de Riego</DialogTitle>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span
                className={`px-2 py-1 rounded-full ${currentStep === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Paso 1
              </span>
              <span
                className={`px-2 py-1 rounded-full ${currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Paso 2
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 0 ? (
            <>
              <Card className="bg-muted/50 border-muted">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Información de la Parcela
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cultivo</p>
                      <p className="font-medium flex items-center gap-2">
                        <span className="text-xl">{selectedCropData.emoji}</span>
                        {selectedCropData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tipo de Suelo</p>
                      <p className="font-medium">{parcel.soilType.label || "No configurado"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fecha de Siembra</p>
                      <p className="font-medium">{new Date(parcel.sowingDate).toLocaleDateString("es-ES")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                      <p className="font-medium text-sm">
                        {parcel.location.latitude.toFixed(2)}°, {parcel.location.longitude.toFixed(2)}°
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Profundidad de Raíces</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Profundidad efectiva del sistema radicular del cultivo</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={[rootDepth]}
                      onValueChange={(value) => setRootDepth(value[0])}
                      max={selectedCropData.rootDepth.max}
                      min={selectedCropData.rootDepth.min}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{selectedCropData.rootDepth.min}m</span>
                      <span className="font-medium text-primary">{rootDepth.toFixed(1)}m</span>
                      <span>{selectedCropData.rootDepth.max}m</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold">Factor de Agua Permisible</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fracción del agua disponible que puede ser extraída sin estrés hídrico</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={[waterFactor]}
                      onValueChange={(value) => setWaterFactor(value[0])}
                      max={selectedCropData.p.max}
                      min={selectedCropData.p.min}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{selectedCropData.p.min}</span>
                      <span className="font-medium text-primary">{waterFactor.toFixed(1)}</span>
                      <span>{selectedCropData.p.max}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setCurrentStep(1)}>Siguiente</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <Label className="text-base font-semibold">Proveedor de Datos Meteorológicos</Label>
                <RadioGroup value={weatherSource} onValueChange={(value) => setWeatherSource(value as WeatherSource)} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="visual-crossing" id="visual-crossing" />
                    <label htmlFor="visual-crossing" className="flex-1 cursor-pointer flex items-start gap-2">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Cloud className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Visual Crossing Weather</div>
                        <p className="text-xs text-muted-foreground">Datos meteorológicos de alta precisión</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="weather-api" id="weather-api" />
                    <label htmlFor="weather-api" className="flex-1 cursor-pointer flex items-start gap-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Settings className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">WeatherAPI.com</div>
                        <p className="text-xs text-muted-foreground">API confiable con cobertura mundial</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="openweathermap" id="openweathermap" />
                    <label htmlFor="openweathermap" className="flex-1 cursor-pointer flex items-start gap-2">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Cloud className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">OpenWeatherMap</div>
                        <p className="text-xs text-muted-foreground">Servicio popular con datos detallados</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="manual" id="manual" />
                    <label htmlFor="manual" className="flex-1 cursor-pointer flex items-start gap-2">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Edit3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Datos manuales</div>
                        <p className="text-xs text-muted-foreground">Introducir datos meteorológicos manualmente</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {weatherSource === "visual-crossing" && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-purple-600" />
                    <Label className="text-base font-medium">Configuración Visual Crossing</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="vc-api-key" className="text-sm">
                        API Key
                      </Label>
                      <Input
                        id="vc-api-key"
                        type="password"
                        placeholder="Ingresa tu API key de Visual Crossing"
                        value={apiKeys.visualCrossing}
                        onChange={(e) => setApiKeys({ ...apiKeys, visualCrossing: e.target.value })}
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-purple-700">Obtén tu API key gratuita en visualcrossing.com</p>
                </div>
              )}

              {weatherSource === "weather-api" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-600" />
                    <Label className="text-base font-medium">Configuración WeatherAPI</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="wa-api-key" className="text-sm">
                        API Key
                      </Label>
                      <Input
                        id="wa-api-key"
                        type="password"
                        placeholder="Ingresa tu API key de WeatherAPI"
                        value={apiKeys.weatherAPI}
                        onChange={(e) => setApiKeys({ ...apiKeys, weatherAPI: e.target.value })}
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">Obtén tu API key gratuita en weatherapi.com</p>
                </div>
              )}

              {weatherSource === "openweathermap" && (
                <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-orange-600" />
                    <Label className="text-base font-medium">Configuración OpenWeatherMap</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="owm-api-key" className="text-sm">
                        API Key
                      </Label>
                      <Input
                        id="owm-api-key"
                        type="password"
                        placeholder="Ingresa tu API key de OpenWeatherMap"
                        value={apiKeys.openWeatherMap}
                        onChange={(e) => setApiKeys({ ...apiKeys, openWeatherMap: e.target.value })}
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-orange-700">Obtén tu API key gratuita en openweathermap.org</p>
                </div>
              )}

              {weatherSource === "manual" && (
                <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Label className="text-base font-medium">Datos meteorológicos</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tempMax" className="text-sm">
                        Temp. máxima (°C)
                      </Label>
                      <Input
                        id="tempMax"
                        type="number"
                        placeholder="28"
                        min="-50"
                        max="60"
                        step="0.1"
                        value={manualDataInput.temperatureMax}
                        onChange={onChangeManualData("temperatureMax")}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tempMin" className="text-sm">
                        Temp. mínima (°C)
                      </Label>
                      <Input
                        id="tempMin"
                        type="number"
                        placeholder="15"
                        min="-50"
                        max="50"
                        step="0.1"
                        value={manualDataInput.temperatureMin}
                        onChange={onChangeManualData("temperatureMin")}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="humidity" className="text-sm">
                        Humedad (%)
                      </Label>
                      <Input
                        id="humidity"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="65"
                        value={manualDataInput.humidity}
                        onChange={onChangeManualData("humidity")}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="windSpeed" className="text-sm">
                        Viento (m/s)
                      </Label>
                      <Input
                        id="windSpeed"
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        placeholder="12"
                        value={manualDataInput.windSpeed}
                        onChange={onChangeManualData("windSpeed")}
                        className="bg-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="solarRadiation" className="text-sm">
                        Radiación solar (MJ/m²/día)
                      </Label>
                      <Input
                        id="solarRadiation"
                        type="number"
                        placeholder="20"
                        min="0"
                        max="50"
                        step="0.1"
                        value={manualDataInput.solarRadiation}
                        onChange={onChangeManualData("solarRadiation")}
                        className="bg-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button onClick={OnClickHandleCalculations} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Guardar Cálculo
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
