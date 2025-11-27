"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { parcelService } from "@/lib/supabase/service/parcel.service"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Droplets, Calendar, TrendingUp, Loader2, Plus, Settings } from "lucide-react"
import type { Parcel } from "@/types/farm"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewCalculationDialog } from "@/components/forms/CreateCalculationDialogForm"
import { useCalculations } from "@/hooks/use-calculations"

export default function ParcelDetailPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const parcelId = params.id as string

  const {
    calculations,
    latestCalculation,
    loadCalculations
  } = useCalculations(parcelId)

  const [parcel, setParcel] = useState<Parcel | null>(null)
  const [parcelError, setParcelError] = useState<string | null>(null)
  const [isLoadingParcel, setIsLoadingParcel] = useState(true)
  const [openNewCalculationDialog, setOpenNewCalculationDialog] = useState(false)

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push("/login")
      return
    }

    if (profile && parcelId) {
      loadParcelData()
    }
  }, [profile, authLoading, parcelId, router])

  const loadParcelData = async () => {
    if (!profile || !parcelId) return

    try {
      setIsLoadingParcel(true)
      setParcelError(null)

      const parcelData = await parcelService.getParcelById(parcelId, profile.id)

      if (!parcelData) {
        setParcelError("Parcela no encontrada")
        router.push("/myparcels")
        return
      }

      setParcel(parcelData)

    } catch (err: any) {
      console.error("Error loading parcel data:", err)
      setParcelError(err.message || "Error al cargar los datos")
    } finally {
      setIsLoadingParcel(false)
    }
  }

  if (authLoading || isLoadingParcel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (parcelError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>{parcelError}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/myparcels">Volver a Mis Parcelas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const handleNewCalculationSave = async () => {

    try {
      await loadCalculations() // Recargar para obtener los últimos datos
    } catch (error) {
      console.error(error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }



  if (!parcel) {
    return null
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/myparcels">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis Parcelas
            </Link>
          </Button>

          {/* Parcel Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance flex items-center gap-3">
                {parcel.crop.emoji && <span className="text-4xl">{parcel.crop.emoji}</span>}
                {parcel.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">{parcel.crop.name || "Configuración pendiente"}</p>
            </div>
            <div className="flex gap-2">

              <Button className="gap-2" onClick={() => setOpenNewCalculationDialog(true)}>

                <Plus className="h-4 w-4" />
                Nuevo Cálculo

              </Button>
            </div>
          </div>

          {/* Parcel Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {parcel.location.latitude !== 0 && parcel.location.longitude !== 0 ? (
                    <div className="text-sm">
                      <div>{parcel.location.latitude.toFixed(4)}°</div>
                      <div>{parcel.location.longitude.toFixed(4)}°</div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No configurada</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Área</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{parcel.area > 0 ? `${parcel.area} ha` : "No configurada"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tipo de Suelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{parcel.soilType.label || "No configurado"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Calculation */}
          {latestCalculation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Último Cálculo</CardTitle>
                <CardDescription>
                  {new Date(latestCalculation.calculatedAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lámina Neta Diaria</p>
                    <p className="text-2xl font-bold text-primary">{latestCalculation.netSheet.toFixed(2)} mm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Volumen Diario</p>
                    <p className="text-2xl font-bold text-blue-600">{latestCalculation.dailyVolume.toFixed(2)} m³</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Frecuencia</p>
                    <p className="text-2xl font-bold text-emerald-600">{latestCalculation.irrigationFrequency} días</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Próximo Riego</p>
                    <p className="text-lg font-bold text-amber-600">{latestCalculation.nextIrrigation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historical Calculations */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cálculos</CardTitle>
              <CardDescription>
                {calculations.length > 0
                  ? (() => {
                    const pluralCulculo = calculations.length === 1 ? "" : "s"
                    const pluralRegistrado = calculations.length === 1 ? "" : "s"
                    return `${calculations.length} cálculo${pluralCulculo} registrado${pluralRegistrado}`
                  })()
                  : "No hay cálculos registrados"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay cálculos registrados para esta parcela</p>
                  <Button onClick={() => setOpenNewCalculationDialog(true)} >
                    Realizar Primer Cálculo
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Lámina Neta</TableHead>
                        <TableHead>Volumen</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead>Próximo Riego</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculations.map((calc) => (
                        <TableRow key={calc.id}>
                          <TableCell className="font-medium">
                            {new Date(calc.calculatedAt).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell>{calc.netSheet.toFixed(2)} mm</TableCell>
                          <TableCell>{calc.dailyVolume.toFixed(2)} m³</TableCell>
                          <TableCell>{calc.irrigationFrequency} días</TableCell>
                          <TableCell>{calc.nextIrrigation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {parcel && (
        <NewCalculationDialog
          open={openNewCalculationDialog}
          onOpenChange={setOpenNewCalculationDialog}
          parcel={parcel}
          onCalculationSave={handleNewCalculationSave}
        />
      )}
    </div>
  )
}