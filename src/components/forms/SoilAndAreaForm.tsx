"use client"

import { soilTypes } from "@/constants/"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Info, Layers } from "lucide-react"
import { Crop, SoilType } from "@/types/farm"
import { ChangeEvent, useState } from "react"

type Props = {
    readonly selectedCrop: Crop | null,
    readonly soilType: SoilType | null
    readonly setSoilType: (value: SoilType) => void
    readonly area: number
    readonly setArea: (value: number) => void
    readonly rootDepth: number
    readonly setRootDepth: (value: number) => void
    readonly waterFactor: number
    readonly setWaterFactor: (value: number) => void
    readonly handleNext: () => void
    readonly handleBack: () => void
}

type AreaUnit = "hectareas" | "m2"

export default function SoilAndAreaForm({
    selectedCrop,
    soilType,
    setSoilType,
    area,
    setArea,
    rootDepth,
    setRootDepth,
    waterFactor,
    setWaterFactor,
    handleNext,
    handleBack,
}: Props) {

    const [areaInput, setAreaInput] = useState<string>("")
    const [areaUnit, setAreaUnit] = useState<AreaUnit>("hectareas")


    const onChangeArea = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setAreaInput(value)

        if (value !== "") {
            const numeric = Number(value)
            if (!isNaN(numeric)) {
                if (areaUnit === "hectareas") {
                    setArea(numeric * 10000)
                } else {
                    setArea(numeric)
                }
            }
        } else {
            setArea(0)
        }
    }


    return (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Layers className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Datos del Suelo y Área</CardTitle>
                <p className="text-muted-foreground">
                    Proporciona información sobre tu terreno para calcular la lámina de riego óptima
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {/* Tipo de Suelo */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Label className="text-base font-semibold">Tipo de Suelo</Label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>El tipo de suelo determina la capacidad de retención de agua</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <RadioGroup
                            value={soilType?.value}
                            onValueChange={(value) => {
                                const found = soilTypes.find(soil => soil.value === value)
                                if (found) setSoilType(found)
                            }}
                            className="space-y-3"
                        >
                            {soilTypes.map((type) => (
                                <div
                                    key={type.value}
                                    className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <RadioGroupItem value={type.value} id={type.value} />
                                    <label htmlFor={type.value} className="flex-1 cursor-pointer flex items-start gap-3">
                                        <span className="text-2xl">{type.emoji}</span>
                                        <div>
                                            <div className="font-medium">{type.label}</div>
                                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Área a Regar */}
                    <div className="space-y-3">
                        <Label htmlFor="area" className="text-base font-semibold">
                            Área a Regar
                        </Label>
                        <div className="flex gap-3">
                            <Input
                                id="area"
                                type="number"
                                placeholder="Ingresa el área"
                                value={areaInput}
                                onChange={onChangeArea}
                                className="text-base"
                                min="0"
                                step="0.01"
                                required
                            />
                            <Select value={areaUnit} onValueChange={(value) => setAreaUnit(value as AreaUnit)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hectareas">Hectáreas</SelectItem>
                                    <SelectItem value="m2">m²</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Profundidad de Raíces */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Profundidad de Raíces</Label>
                        <Slider
                            value={[rootDepth]}
                            onValueChange={(value) => setRootDepth(value[0])}
                            max={selectedCrop?.rootDepth?.max ?? 2.5}
                            min={selectedCrop?.rootDepth?.min ?? 0.3}
                            step={0.1}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{selectedCrop ? selectedCrop.rootDepth.min : 0.3}m</span>
                            <span className="font-medium text-primary">{rootDepth}m</span>
                            <span>{selectedCrop ? selectedCrop.rootDepth.max : 2.5}m</span>
                        </div>
                    </div>

                    {/* Factor de Agua */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Factor de Agua Permisible</Label>
                        <Slider
                            value={[waterFactor]}
                            onValueChange={(value) => setWaterFactor(value[0])}
                            max={selectedCrop ? selectedCrop.p.max : 0.7}
                            min={selectedCrop ? selectedCrop.p.min : 0.2}
                            step={0.1}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{selectedCrop ? selectedCrop.p.min : 0.2}</span>
                            <span className="font-medium text-primary">{waterFactor}</span>
                            <span>{selectedCrop ? selectedCrop.p.max : 0.7}</span>
                        </div>
                    </div>

                    {/* Navegación */}
                    <div className="flex gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 text-base">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Atrás
                        </Button>
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
                            disabled={!soilType || !area}
                        >
                            Siguiente
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
