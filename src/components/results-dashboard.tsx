"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Droplets,
  Calendar,
  TrendingUp,
  Clock,
  RotateCcw,
  Sprout,
  Gauge,
  Home,
} from "lucide-react"

interface ResultsData {
  cultivo: string
  fechaSiembra: string
  tipoSuelo: string
  area: string
  areaUnit: string
  laminaNeta: number
  volumenDiario: number
  frecuenciaRiego: number
  proximoRiego: string
  etapaCultivo: string
  kcActual: number
  eto: number
}

interface ResultsDashboardProps {
  data: ResultsData
}



export function ResultsDashboard({ data }: Readonly<ResultsDashboardProps>) {
  // Datos simulados para los próximos 7 días
  const parseProx = (fechaReferencia: string) => {
    return new Date(fechaReferencia).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  }

  const handleNewCalculation = () => {
    console.log("[v0] Iniciando nuevo cálculo")
    globalThis.location.href = "/"
  }

  const handleExportPDF = () => {
    console.log("[v0] Exportando PDF")
    // Lógica para exportar PDF
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header con resumen */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Sprout className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Resultados de Riego - {data.cultivo}</h1>
                    <p className="text-muted-foreground">
                      Fecha de siembra: {data.fechaSiembra} • Suelo: {data.tipoSuelo} • Área: {data.area}{" "}
                      {data.areaUnit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {data.etapaCultivo}
                  </Badge>
                  <Button
                    onClick={() => (globalThis.location.href = "/")}
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

        {/* Cards principales con métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Lámina neta diaria - Card destacado */}
          <Card className="md:col-span-2 lg:col-span-1 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Lámina Neta Diaria</CardTitle>
                <Droplets className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                {data.laminaNeta.toFixed(2)}
                <span className="text-lg font-normal text-muted-foreground ml-1">mm/día</span>
              </div>
              <p className="text-sm text-muted-foreground">Requerimiento principal</p>
            </CardContent>
          </Card>

          {/* Volumen diario */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Volumen Total</CardTitle>
                <Gauge className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {data.volumenDiario.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground ml-1">L/m</span>
              </div>
              <p className="text-sm text-muted-foreground">Para toda el area</p>
            </CardContent>
          </Card>

          {/* Frecuencia de riego */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Frecuencia de Riego</CardTitle>
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {data.frecuenciaRiego.toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground ml-1">días</span>
              </div>
              <p className="text-sm text-muted-foreground">Entre riegos</p>
            </CardContent>
          </Card>

          {/* Próximo riego */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Riego</CardTitle>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground mb-1">{parseProx(data.proximoRiego)}</div>
              <p className="text-sm text-muted-foreground">Fecha programada</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto mb-8">

          {/* Tabla con detalles técnicos */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Detalles Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Evapotranspiración (ETo)</span>
                  <span className="font-semibold">{data.eto} mm/día</span>
                </div>
                <Separator />

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Coeficiente KC Actual</span>
                  <span className="font-semibold">{data.kcActual}</span>
                </div>
                <Separator />

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Etapa del Cultivo</span>
                  <Badge variant="outline">{data.etapaCultivo}</Badge>
                </div>
                <Separator />

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Tipo de Suelo</span>
                  <span className="font-semibold">{data.tipoSuelo}</span>
                </div>
                <Separator />

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Área Total</span>
                  <span className="font-semibold">
                    {data.area} {data.areaUnit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Button
            onClick={handleNewCalculation}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 min-w-48 bg-transparent"
          >
            <RotateCcw className="h-5 w-5" />
            Nuevo Cálculo
          </Button>

        </div>
      </div>
    </div>
  )
}
