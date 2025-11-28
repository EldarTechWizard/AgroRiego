'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Exception fetching profile:', error)
      return null
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // Función unificada para manejar la sesión y el perfil
    const handleSession = async (currentSession: Session | null) => {
      try {
        if (!mounted) return

        if (currentSession?.user) {
          // 1. Tenemos sesión, actualizamos estado básico
          setSession(currentSession)
          setUser(currentSession.user)

          // 2. Buscamos el perfil solo si el usuario cambió o no tenemos perfil
          // Esto evita llamadas innecesarias
          const profileData = await fetchProfile(currentSession.user.id)

          if (mounted) {
            setProfile(profileData)
          }
        } else {
          // 3. NO hay sesión: Limpieza TOTAL
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error handling session:', error)
      } finally {
        // 4. SIEMPRE apagamos el loading al final, pase lo que pase
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // A. Chequeo inicial (GetSession)
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // B. Listener de eventos (Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Reiniciamos loading a true solo si es un evento de cambio mayor
        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          // Opcional: setLoading(true) si quieres mostrar spinner mientras cargas perfil
        }

        if (_event === 'SIGNED_OUT') {
          // Limpieza explícita e inmediata
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          router.refresh() // Forzar limpieza de caché de Next.js
        } else {
          handleSession(session)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, router])
  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)

    // Luego decimos a Supabase que cierre
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (name: string) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)

    if (error) throw error

    const updatedProfile = await fetchProfile(user.id)
    if (updatedProfile) {
      setProfile(updatedProfile)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}