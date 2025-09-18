import { Droplets, Sprout, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20"></div>
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent/20"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-secondary/20"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                Calcula la <span className="text-primary">lámina de riego</span> perfecta para tus cultivos
              </h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Optimiza el uso del agua en tu campo con cálculos precisos basados en datos científicos. Mejora tus
                rendimientos mientras cuidas el medio ambiente.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Cálculo Preciso</h3>
                  <p className="text-xs text-muted-foreground">Basado en datos científicos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">24 Cultivos</h3>
                  <p className="text-xs text-muted-foreground">Amplia variedad disponible</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Análisis Detallado</h3>
                  <p className="text-xs text-muted-foreground">Reportes completos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-8 flex items-center justify-center">
              <div className="w-full h-full bg-card rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary rounded-full mx-auto flex items-center justify-center">
                    <Droplets className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary">AgroRiego</h3>
                  <p className="text-muted-foreground">Tecnología agrícola avanzada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
