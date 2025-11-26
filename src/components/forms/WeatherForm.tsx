"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Cloud, Edit3, ArrowLeft, Calculator, Key, Settings } from "lucide-react"
import { ChangeEvent, useState } from "react"
import { ManualWeatherInput } from "@/lib/weather/providers/ManualDataProviders"
import { useEt0Calculator } from "@/hooks/use-et0-calculator-service"

type WeatherSource = "visual-crossing" | "weather-api" | "openweathermap" | "manual"

type Location = {
    latitude: number;
    longitude: number;
}

type Props = {
    readonly et0: number
    readonly setEt0: (value: number) => void
    readonly handleBack: () => void
    readonly handleSubmit: (e: React.FormEvent) => void
}

export default function WeatherForm({
    et0,
    setEt0,
    handleBack,
    handleSubmit,
}: Props) {
    const { fetchETo } = useEt0Calculator()
    const [weatherSource, setWeatherSource] = useState<WeatherSource>("visual-crossing")
    const [location, setLocation] = useState<Location>({ latitude: 0, longitude: 0 })
    const [locationInput, setLocationInput] = useState<Record<keyof Location, string>>({ latitude: "", longitude: "" })


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


    const [manualDataInput, setManualDataInput] = useState<Record<keyof ManualWeatherInput, string>>({
        temperatureMax: "",        // °C
        temperatureMin: "",        // °C
        humidity: "",       // % HR media
        windSpeed: "",      // m/s a 2m
        solarRadiation: "", // MJ/m²/día
        eto: "",
    })

    const isFormValid = () => {
        if (weatherSource === "manual") {
            return manualDataInput.temperatureMax &&
                manualDataInput.temperatureMin &&
                manualDataInput.humidity &&
                manualDataInput.windSpeed &&
                manualDataInput.solarRadiation;
        } else {
            const hasLocation = locationInput.latitude && locationInput.longitude;
            const hasApiKey = weatherSource === "visual-crossing" ? apiKeys.visualCrossing :
                weatherSource === "weather-api" ? apiKeys.weatherAPI :
                    weatherSource === "openweathermap" ? apiKeys.openWeatherMap : false;

            return hasLocation && hasApiKey;
        }
    };

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
            setLocation(prev => ({
                ...prev,
                [field]: numeric,
            }));
        }
    };


    const handlePreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await fetchETo({
                weatherSource,
                apiKeys,
                location,
                manualData: weatherSource === "manual" ? manualData : undefined
            })

            console.log('ETo obtenido:', result)

            setEt0(result.eto);

            handleSubmit(e);
        } catch (err) {
            console.error('Error:', err)
        }


    }


    return (
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Cloud className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Datos Meteorológicos</CardTitle>
                <p className="text-muted-foreground">
                    Selecciona la fuente de datos meteorológicos para cálculos precisos
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                <form onSubmit={handlePreSubmit} className="space-y-6">
                    {/* Fuente de datos */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Fuente de Datos Meteorológicos</Label>

                        <RadioGroup
                            value={weatherSource}
                            onValueChange={(value) => setWeatherSource(value as WeatherSource)}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="visual-crossing" id="visual-crossing" />
                                <label htmlFor="visual-crossing" className="flex-1 cursor-pointer flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <Cloud className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">🌤️ Visual Crossing Weather</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Datos meteorológicos globales de alta precisión
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="weather-api" id="weather-api" />
                                <label htmlFor="weather-api" className="flex-1 cursor-pointer flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Settings className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">🌍 WeatherAPI.com</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            API meteorológica confiable con cobertura mundial
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="openweathermap" id="openweathermap" />
                                <label htmlFor="openweathermap" className="flex-1 cursor-pointer flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-orange-100">
                                        <Cloud className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">🌦️ OpenWeatherMap</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Servicio meteorológico popular con datos detallados
                                        </p>
                                    </div>
                                </label>
                            </div>



                            {/* Manual */}
                            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="manual" id="manual" />
                                <label htmlFor="manual" className="flex-1 cursor-pointer flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-amber-100">
                                        <Edit3 className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">✏️ Datos manuales</div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Introducir datos meteorológicos manualmente
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Condicionales */}
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="vc-latitude" className="text-sm">
                                            Latitud
                                        </Label>
                                        <Input
                                            id="vc-latitude"
                                            type="number"
                                            placeholder="20.6597"
                                            value={locationInput.latitude}
                                            onChange={onChangeLocationData("latitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-90"
                                            max="90"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="vc-longitude" className="text-sm">
                                            Longitud
                                        </Label>
                                        <Input
                                            id="vc-longitude"
                                            type="number"
                                            placeholder="-103.3496"
                                            value={locationInput.longitude}
                                            onChange={onChangeLocationData("longitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-180"
                                            max="180"
                                        />
                                    </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="wa-latitude" className="text-sm">
                                            Latitud
                                        </Label>
                                        <Input
                                            id="wa-latitude"
                                            type="number"
                                            placeholder="20.6597"
                                            value={locationInput.latitude}
                                            onChange={onChangeLocationData("latitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-90"
                                            max="90"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="wa-longitude" className="text-sm">
                                            Longitud
                                        </Label>
                                        <Input
                                            id="wa-longitude"
                                            type="number"
                                            placeholder="-103.3496"
                                            value={locationInput.longitude}
                                            onChange={onChangeLocationData("longitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-180"
                                            max="180"
                                        />
                                    </div>
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="owm-latitude" className="text-sm">
                                            Latitud
                                        </Label>
                                        <Input
                                            id="owm-latitude"
                                            type="number"
                                            placeholder="20.6597"
                                            value={locationInput.latitude}
                                            onChange={onChangeLocationData("latitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-90"
                                            max="90"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="owm-longitude" className="text-sm">
                                            Longitud
                                        </Label>
                                        <Input
                                            id="owm-longitude"
                                            type="number"
                                            placeholder="-103.3496"
                                            value={locationInput.longitude}
                                            onChange={onChangeLocationData("longitude")}
                                            className="bg-white mt-1"
                                            step="0.000001"
                                            min="-180"
                                            max="180"
                                        />
                                    </div>
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

                    {/* Botones */}
                    <div className="flex gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 text-base">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Atrás
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 text-base bg-primary hover:bg-primary/90"
                            disabled={!isFormValid()}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Calcular Riego
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
