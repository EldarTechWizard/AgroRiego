"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  AlertTriangle,
  Sprout,
  TrendingUp,
  Home,
  ArrowLeft,
} from "lucide-react"

interface WeeklyCalendarProps {
  cultivo: string
}

export function WeeklyIrrigationCalendar({ cultivo }: WeeklyCalendarProps) {
  // Datos simulados para los próximos 7 días
  const weeklySchedule = [
    {
      date: "15 Ene",
      day: "Lun",
      weather: "sunny",
      temp: 28,
      irrigation: 4.2,
      needsWater: true,
    },
    {
      date: "16 Ene",
      day: "Mar",
      weather: "cloudy",
      temp: 25,
      irrigation: 0,
      needsWater: false,
    },
    {
      date: "17 Ene",
      day: "Mié",
      weather: "sunny",
      temp: 30,
      irrigation: 4.5,
      needsWater: true,
    },
    {
      date: "18 Ene",
      day: "Jue",
      weather: "rainy",
      temp: 22,
      irrigation: 0,
      needsWater: false,
    },
    {
      date: "19 Ene",
      day: "Vie",
      weather: "sunny",
      temp: 29,
      irrigation: 3.9,
      needsWater: true,
    },
    {
      date: "20 Ene",
      day: "Sáb",
      weather: "cloudy",
      temp: 26,
      irrigation: 2.1,
      needsWater: true,
    },
    {
      date: "21 Ene",
      day: "Dom",
      weather: "sunny",
      temp: 31,
      irrigation: 4.0,
      needsWater: true,
    },
  ]

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case "sunny":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const totalWeeklyWater = weeklySchedule.reduce((sum, day) => sum + day.irrigation, 0)
  const irrigationDays = weeklySchedule.filter((day) => day.needsWater).length

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Calendario de Riego Semanal</h1>
                    <p className="text-muted-foreground">Programación para {cultivo} • Semana del 15 al 21 de Enero</p>
                  </div>
                </div>
                {/* Botones de navegación */}
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
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendario principal - 7 días */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Programación Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                  {weeklySchedule.map((day, index) => (
                    <Card
                      key={index}
                      className={`relative transition-all duration-200 hover:shadow-md ${
                        day.needsWater
                          ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                          : "bg-gradient-to-br from-muted/50 to-muted/30 border-muted"
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        {/* Badge de REGAR */}
                        {day.needsWater && (
                          <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1">
                            REGAR
                          </Badge>
                        )}

                        {/* Día y fecha */}
                        <div className="mb-3">
                          <div className="font-bold text-foreground">{day.day}</div>
                          <div className="text-sm text-muted-foreground">{day.date}</div>
                        </div>

                        {/* Icono del clima */}
                        <div className="flex justify-center mb-3">{getWeatherIcon(day.weather)}</div>

                        {/* Temperatura */}
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{day.temp}°C</span>
                        </div>

                        {/* mm de riego */}
                        <div className="flex items-center justify-center gap-1">
                          <Droplets
                            className={`h-4 w-4 ${day.needsWater ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-sm font-bold ${day.needsWater ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {day.irrigation} mm
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="xl:col-span-1 space-y-6">
            {/* Resumen semanal */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Resumen Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-1">{totalWeeklyWater.toFixed(1)} mm</div>
                  <div className="text-sm text-muted-foreground">Total de agua</div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Días de riego</span>
                  <Badge variant="secondary">{irrigationDays} de 7</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Promedio diario</span>
                  <span className="font-semibold">{(totalWeeklyWater / 7).toFixed(1)} mm</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Eficiencia</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Óptima
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alertas meteorológicas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alertas Meteorológicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">Lluvia prevista</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Jueves 18 Ene - Suspender riego programado</p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-sm">Temperaturas altas</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Domingo 21 Ene - Considerar riego adicional</p>
                </div>
              </CardContent>
            </Card>

            {/* Notas del cultivo */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-green-600" />
                  Notas del Cultivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-sm text-green-800 mb-1">Etapa de Desarrollo</div>
                  <p className="text-xs text-green-700">
                    El {cultivo} está en fase de crecimiento vegetativo. Mantener humedad constante.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-sm text-blue-800 mb-1">Recomendación</div>
                  <p className="text-xs text-blue-700">
                    Monitorear la humedad del suelo antes de cada riego programado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
