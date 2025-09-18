import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CalculatorCard } from "@/components/calculator-card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <CalculatorCard />
          </div>
        </section>
      </main>
    </div>
  )
}
