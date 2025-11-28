'use client'

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { User, LogOut, Leaf, LayoutDashboard, Menu } from "lucide-react"
import { useState } from "react"


export function Header() {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const handleMobileNav = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg group-hover:shadow-lg transition-shadow">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">AgroRiego</span>
          </Link>

          {/* VISTA ESCRITORIO (Desktop) - Se mantiene oculta en mobile */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-3">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-sm">Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/myparcels" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span className="text-sm">Mis Parcelas</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm">Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={loading ? "#" : "/login"}>Iniciar Sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={loading ? "#" : "/register"}>Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          {/* VISTA MÓVIL (Mobile) - Menú Hamburguesa */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-3">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    AgroRiego
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-2">
                  {profile ? (
                    // Usuario Logueado en Mobile
                    <>
                      <div className="px-2 py-2 bg-muted rounded-md mb-2">
                        <p className="text-sm text-muted-foreground">Hola,</p>
                        <p className="font-medium">{profile.name}</p>
                      </div>

                      <Link
                        href="/myparcels"
                        onClick={handleMobileNav}
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:text-primary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Mis Parcelas
                      </Link>

                      <div className="h-px bg-border my-2" />

                      <Button
                        variant="destructive"
                        className="w-full justify-start gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : (
                    // Usuario NO Logueado en Mobile
                    <>
                      <Button asChild className="w-full" onClick={handleMobileNav}>
                        <Link href="/login">Iniciar Sesión</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={handleMobileNav}>
                        <Link href="/register">Registrarse</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  )
}