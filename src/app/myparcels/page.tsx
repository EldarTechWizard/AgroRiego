"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Calendar, Loader2 } from "lucide-react"
import { useParcels } from '@/hooks/use-parcels'
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateParcelDialog } from "@/components/forms/CreateParcelStepForm"
import { Parcel } from "@/types/farm"


export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const router = useRouter()
  const { parcels, isLoading, createParcel } = useParcels()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Omit<Parcel, 'id' | 'userId' | 'createdAt' | 'calculations'>>({
    name: "",
    area: 0,
    sowingDate: new Date(),
    crop: {
      name: "",
      value: "",
      emoji: "",
      Kc: { inicial: 0, desarrollo: 0, media: 0, final: 0 },
      rootDepth: { min: 0, max: 0 },
      p: { min: 0, max: 0 }
    },
    soilType: {
      value: "",
      emoji: "",
      label: "",
      CC: 0,
      PMP: 0,
      Da: 0,
      description: ""
    },
    location: {
      latitude: 0,
      longitude: 0
    }
  })
  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login")
    }
  }, [profile, loading, router])


  const handleCreateParcel = async () => {
    if (!profile) return

    setIsCreating(true)

    try {
      await createParcel(formData.name, formData)
      setIsDialogOpen(false)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance">Mis Parcelas</h1>
              <p className="text-lg text-muted-foreground mt-2">Gestiona tus parcelas y cálculos de riego</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Parcela
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Parcela</DialogTitle>
                  <DialogDescription>Ingresa un nombre para tu nueva parcela</DialogDescription>
                </DialogHeader>
                <CreateParcelDialog handleCreateParcel={handleCreateParcel} formData={formData} setFormData={setFormData} isCreating={isCreating}/>
              </DialogContent>
            </Dialog>
          </div>

          {/* Parcels Grid */}
          {parcels.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tienes parcelas aún</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Crea tu primera parcela para comenzar a calcular las necesidades de riego de tus cultivos
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primera Parcela
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcels.map((parcel) => (
                <Link key={parcel.id} href={`/parcel/${parcel.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{parcel.name}</CardTitle>
                          {parcel.crop && (
                            <CardDescription className="flex items-center gap-2">
                              <span className="text-2xl">{parcel.crop.emoji}</span>
                              <span>{parcel.crop.name}</span>
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {parcel.location.latitude !== 0 && parcel.location.longitude !== 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {parcel.location.latitude.toFixed(4)}, {parcel.location.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Creada {new Date(parcel.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!parcel.crop && (
                        <div className="pt-2">
                          <span className="text-sm text-amber-600 font-medium">Configuración pendiente</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
