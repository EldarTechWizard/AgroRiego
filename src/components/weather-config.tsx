"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { MapPin, Satellite, Edit3, Cloud, Thermometer, Droplets, Wind, Save, Home, ArrowLeft } from "lucide-react"

type WeatherSource = "auto" | "station" | "manual"

interface WeatherData {
  temperature: { max: number; min: number }
  humidity: number
  windSpeed: number
  eto: number
  location: string
}

export function WeatherConfig() {
  const [selectedSource, setSelectedSource] = useState<WeatherSource>("auto")
  const [location, setLocation] = useState("")
  const [manualData, setManualData] = useState({
    tempMax: "",
    tempMin: "",
    humidity: "",
    windSpeed: "",
  })

  // Datos de ejemplo para el preview
  const currentWeatherData: WeatherData = {
    temperature: { max: 28, min: 15 },
    humidity: 65,
    windSpeed: 12,
    eto: 4.2,
    location: "Guadalajara, Jalisco",
  }

  const handleSaveConfiguration = () => {
    console.log("[v0] Guardando configuración meteorológica:", {
      source: selectedSource,
      location,
      manualData,
    })
    // Aquí se implementaría la lógica de guardado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-3xl font-bold text-emerald-800 text-balance">Configurar Datos Meteorológicos</h1>
            <p className="text-emerald-600 text-pretty">
              Selecciona la fuente de datos meteorológicos para cálculos precisos de riego
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => (window.location.href = "/results")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Resultados
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Button>
          </div>
        </div>

        {/* Options Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSource === "auto" ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedSource("auto")}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <Satellite className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Automático por ubicación</CardTitle>
              <CardDescription>Datos meteorológicos automáticos basados en GPS</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center">
                <RadioGroup value={selectedSource} onValueChange={setSelectedSource}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="sr-only">
                      Automático
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSource === "station" ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedSource("station")}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Estación meteorológica</CardTitle>
              <CardDescription>Conectar con estación meteorológica cercana</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center">
                <RadioGroup value={selectedSource} onValueChange={setSelectedSource}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="station" id="station" />
                    <Label htmlFor="station" className="sr-only">
                      Estación
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSource === "manual" ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedSource("manual")}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <Edit3 className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Datos manuales</CardTitle>
              <CardDescription>Introducir datos meteorológicos manualmente</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center">
                <RadioGroup value={selectedSource} onValueChange={setSelectedSource}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="sr-only">
                      Manual
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conditional Forms */}
        {selectedSource === "auto" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-emerald-600" />
                Configuración Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Ciudad o coordenadas</Label>
                <Input
                  id="location"
                  placeholder="Ej: Guadalajara, Jalisco o 20.6597, -103.3496"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-sm text-emerald-700">
                  Los datos se actualizarán automáticamente cada hora desde servicios meteorológicos
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSource === "station" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Estación Meteorológica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-48 flex items-center justify-center">
                <div className="text-center text-blue-600">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Mapa interactivo de estaciones</p>
                  <p className="text-xs text-blue-500 mt-1">Selecciona la estación más cercana a tu cultivo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estación seleccionada</Label>
                  <Input value="Estación CONAGUA - Guadalajara" readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Distancia</Label>
                  <Input value="2.3 km" readOnly className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSource === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                Datos Manuales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempMax">Temperatura máxima (°C)</Label>
                  <Input
                    id="tempMax"
                    type="number"
                    placeholder="28"
                    value={manualData.tempMax}
                    onChange={(e) => setManualData({ ...manualData, tempMax: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tempMin">Temperatura mínima (°C)</Label>
                  <Input
                    id="tempMin"
                    type="number"
                    placeholder="15"
                    value={manualData.tempMin}
                    onChange={(e) => setManualData({ ...manualData, tempMin: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="humidity">Humedad relativa (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    placeholder="65"
                    value={manualData.humidity}
                    onChange={(e) => setManualData({ ...manualData, humidity: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="windSpeed">Velocidad del viento (km/h)</Label>
                  <Input
                    id="windSpeed"
                    type="number"
                    placeholder="12"
                    value={manualData.windSpeed}
                    onChange={(e) => setManualData({ ...manualData, windSpeed: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview de datos actuales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Vista Previa de Datos Actuales
            </CardTitle>
            <CardDescription>Datos meteorológicos que se utilizarán para los cálculos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Temp. Máx</p>
                <p className="text-lg font-semibold text-red-600">{currentWeatherData.temperature.max}°C</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <Thermometer className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Temp. Mín</p>
                <p className="text-lg font-semibold text-blue-600">{currentWeatherData.temperature.min}°C</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg text-center">
                <Droplets className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Humedad</p>
                <p className="text-lg font-semibold text-cyan-600">{currentWeatherData.humidity}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Viento</p>
                <p className="text-lg font-semibold text-gray-600">{currentWeatherData.windSpeed} km/h</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700">ETo calculado</p>
                  <p className="text-xl font-bold text-emerald-800">{currentWeatherData.eto} mm/día</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {currentWeatherData.location}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex justify-center">
          <Button
            onClick={handleSaveConfiguration}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  )
}
