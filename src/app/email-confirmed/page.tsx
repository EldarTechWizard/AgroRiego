"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Home } from "lucide-react"
import Link from "next/link"


export default function EmailConfirmedPage() {


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">¡Correo verificado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              Tu correo ha sido verificado correctamente. Tu cuenta está completamente activada y lista para usar.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center font-medium">¿Qué deseas hacer ahora?</p>
            <Link href="/login" className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <ArrowRight className="mr-2 h-4 w-4" />
                Ir al Login
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
