"use client"

import { ChangeEvent,  useState } from "react"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  Loader2, ChevronRight, ChevronLeft } from "lucide-react"
import type { Location, Parcel } from "@/types/farm"
import { crops, soilTypes } from "@/constants/"


type AreaUnit = "hectareas" | "m2"

interface CreateParcelDialogProps {
    handleCreateParcel: () => void;
    formData: Omit<Parcel, 'id' | 'userId' | 'createdAt' | 'calculations'>
    setFormData: (data: Omit<Parcel, 'id' | 'userId' | 'createdAt' | 'calculations'>) => void
    isCreating: boolean;
}


export function CreateParcelDialog({ handleCreateParcel, formData, setFormData, isCreating }: Readonly<CreateParcelDialogProps>) {
    const [currentStep, setCurrentStep] = useState(0)
    const [areaInput, setAreaInput] = useState<string>("")
    const [locationInput, setLocationInput] = useState<Record<keyof Location, string>>({ latitude: "", longitude: "" })
    const [areaUnit, setAreaUnit] = useState<AreaUnit>("hectareas")

    const steps = [
        { title: "Información General", description: "Nombre, fecha, área y ubicación de tu parcela" },
        { title: "Cultivo", description: "Selecciona el cultivo que vas a cultivar" },
        { title: "Suelo", description: "Selecciona el tipo de suelo de tu parcela" },
    ]


    const canProceedToNext = () => {
        switch (currentStep) {
            case 0:
                return (
                    formData?.name.trim() !== "" &&
                    formData?.area !== 0 &&
                    areaInput !== "" &&
                    formData?.location.latitude !== 0 &&
                    formData?.location.longitude !== 0 &&
                    locationInput.latitude !== "" &&
                    locationInput.longitude !== ""
                )
            case 1:
                return formData?.crop?.value !== ""
            case 2:
                return formData?.soilType?.value !== ""
            default:
                return false
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }


    const onChangeArea = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setAreaInput(value)

        if (value === "") {
            setFormData({ ...formData, area: 0 })
        } else {
            const numeric = Number(value)
            if (!Number.isNaN(numeric)) {
                if (areaUnit === "hectareas") {
                    setFormData({ ...formData, area: numeric * 1000 })
                } else {
                    setFormData({ ...formData, area: numeric })
                }
            }
        }
    }

    const onChangeLocationData = (field: keyof Location) => (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Actualiza el input visible
        setLocationInput(prev => ({
            ...prev,
            [field]: value,
        }));

        // Convierte a número o 0 si está vacío
        const numeric = value === "" ? 0 : Number(value);
        if (!Number.isNaN(numeric)) {
            setFormData({
                ...formData,
                location: {
                    ...formData.location,
                    [field]: numeric,
                },
            });
        }
    };

    return (
        <>

            {/* Progress Bar */}
            <div className="w-full space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        Paso {currentStep + 1} de {steps.length}
                    </span>
                    <span>{steps[currentStep].title}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="py-4 min-h-[280px] sm:min-h-[320px]">
                {currentStep === 0 && (
                    <div className="space-y-3">
                        {/* Información General */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Información General
                            </h3>
                            <Input
                                placeholder="Ej: Parcela Norte"
                                value={formData?.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-sm h-8"
                            />
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Datos de Siembra y Área */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Siembra y Área</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="sowingDate" className="text-xs font-medium">
                                        Fecha de Siembra
                                    </Label>
                                    <Input
                                        id="sowingDate"
                                        type="date"
                                        value={formData.sowingDate.toISOString().split("T")[0]}
                                        onChange={(e) => setFormData({ ...formData, sowingDate: new Date(e.target.value) })}
                                        className="text-sm h-8"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="area" className="text-xs font-medium">
                                        Área a Regar
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Área"
                                            value={areaInput}
                                            onChange={onChangeArea}
                                            className="flex-1 text-sm h-8"
                                            min="0"
                                            step="0.01"
                                        />
                                        <Select
                                            value={areaUnit}
                                            onValueChange={(value) => setAreaUnit(value as AreaUnit)}
                                        >
                                            <SelectTrigger className="w-20 sm:w-24 h-8 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hectareas">Ha</SelectItem>
                                                <SelectItem value="m2">m²</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Ubicación Geográfica */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Ubicación Geográfica
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="latitude" className="text-xs font-medium">
                                        Latitud
                                    </Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        placeholder="-23.6345"
                                        value={locationInput.latitude}
                                        onChange={onChangeLocationData("latitude")}
                                        className="text-sm h-8"
                                        min="-90"
                                        max="90"
                                        step="0.0001"
                                    />
                                    <p className="text-xs text-muted-foreground">Entre -90 y 90</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="longitude" className="text-xs font-medium">
                                        Longitud
                                    </Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        placeholder="-46.3254"
                                        value={locationInput.longitude}
                                        onChange={onChangeLocationData("longitude")}
                                        className="text-sm h-8"
                                        min="-180"
                                        max="180"
                                        step="0.0001"
                                    />
                                    <p className="text-xs text-muted-foreground">Entre -180 y 180</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Selecciona tu Cultivo
                        </Label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-[320px] overflow-y-auto pr-2">
                            {crops.map((crop) => (
                                <Card
                                    key={crop.value}
                                    className={`cursor-pointer transition-all ${formData.crop.value === crop.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                                        }`}
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            crop: crop,
                                        })
                                    }
                                >
                                    <CardContent className="p-2 text-center">
                                        <div className="text-lg sm:text-xl mb-0.5">{crop.emoji}</div>
                                        <p className="text-xs font-medium line-clamp-2">{crop.name}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Tipo de Suelo
                        </Label>
                        <RadioGroup
                            value={formData.soilType.value}
                            onValueChange={(value) => {
                                const found = soilTypes.find(soil => soil.value === value)
                                if (found) setFormData({ ...formData, soilType: found })
                            }}
                        >
                            {soilTypes.map((type) => (
                                <div
                                    key={type.value}
                                    className="flex items-center space-x-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                                >
                                    <RadioGroupItem value={type.value} id={type.value} />
                                    <label htmlFor={type.value} className="flex-1 cursor-pointer flex items-start gap-2 min-w-0">
                                        <span className="text-xl flex-shrink-0">{type.emoji}</span>
                                        <div className="min-w-0">
                                            <div className="font-medium text-xs">{type.label}</div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{type.description}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-2 border-t">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="gap-1 bg-transparent"
                    size="sm"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Anterior
                </Button>

                {currentStep === steps.length - 1 ? (
                    <Button
                        onClick={handleCreateParcel}
                        disabled={!canProceedToNext() || isCreating}
                        className="flex-1 gap-1"
                        size="sm"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            "Crear Parcela"
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext} disabled={!canProceedToNext()} className="flex-1 gap-1" size="sm">
                        Siguiente
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </>
    )
}
