import { createClient } from '@/lib/supabase/client'
import { Parcel, Crop, SoilType } from '@/types/farm';

export class ParcelService {
  readonly supabase = createClient()

  /**
   * Obtiene todas las parcelas de un usuario
   */
  async getUserParcels(userId: string): Promise<Parcel[]> {
    const { data, error } = await this.supabase
      .from('parcels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading parcels:', error)
      throw new Error('No se pudieron cargar las parcelas')
    }

    return this.transformParcels(data)
  }

  /**
   * Obtiene una parcela específica con sus cálculos
   */
  async getParcelById(parcelId: string, userId: string): Promise<Parcel | null> {
    const { data, error } = await this.supabase
      .from('parcels')
      .select(`
        *,
        calculations (*)
      `)
      .eq('id', parcelId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error loading parcel:', error)
      return null
    }

    return this.transformParcelWithCalculations(data)
  }

  /**
   * Crea una nueva parcela
   */
  async createParcel(
    userId: string,
    name: string,
    partialData?: Partial<Omit<Parcel, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Parcel> {
    const newParcelData = {
      user_id: userId,
      name: name.trim(),
      location: partialData?.location || { latitude: 0, longitude: 0 },
      area: partialData?.area || 0,
      sowing_date: partialData?.sowingDate?.toISOString() || new Date().toISOString(),
      crop: partialData?.crop || this.getEmptyCrop(),
      soil_type: partialData?.soilType || this.getEmptySoilType()
    }

    const { data, error } = await this.supabase
      .from('parcels')
      .insert(newParcelData)
      .select()
      .single()

    if (error) {
      console.error('Error creating parcel:', error)
      throw new Error('No se pudo crear la parcela')
    }

    return this.transformParcel(data)
  }

  /**
   * Actualiza una parcela existente
   */
  async updateParcel(
    parcelId: string,
    userId: string,
    updates: Partial<Omit<Parcel, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Parcel> {
    const updateData: any = {}

    if (updates.name) updateData.name = updates.name
    if (updates.area !== undefined) updateData.area = updates.area
    if (updates.sowingDate) updateData.sowing_date = updates.sowingDate.toISOString()
    if (updates.crop) updateData.crop = updates.crop
    if (updates.soilType) updateData.soil_type = updates.soilType
    if (updates.location) updateData.location = updates.location

    const { data, error } = await this.supabase
      .from('parcels')
      .update(updateData)
      .eq('id', parcelId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating parcel:', error)
      throw new Error('No se pudo actualizar la parcela')
    }

    return this.transformParcel(data)
  }

  /**
   * Elimina una parcela
   */
  async deleteParcel(parcelId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('parcels')
      .delete()
      .eq('id', parcelId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting parcel:', error)
      throw new Error('No se pudo eliminar la parcela')
    }
  }

  /**
   * Migra datos desde localStorage
   */
  async migrateFromLocalStorage(userId: string): Promise<number> {
    const parcelsData = localStorage.getItem("agroriego_parcels")
    if (!parcelsData) return 0

    try {
      const allParcels = JSON.parse(parcelsData)
      const userParcels = allParcels.filter((p: Parcel) => p.userId === "0")

      let migratedCount = 0

      for (const parcel of userParcels) {
        const newParcelData = {
          user_id: userId,
          name: parcel.name,
          location: parcel.location,
          area: parcel.area,
          sowing_date: new Date(parcel.sowingDate).toISOString(),
          crop: parcel.crop,
          soil_type: parcel.soilType
        }

        const { error } = await this.supabase
          .from('parcels')
          .insert(newParcelData)

        if (!error) migratedCount++
      }

      // Limpiar localStorage después de migrar
      if (migratedCount > 0) {
        localStorage.removeItem("agroriego_parcels")
      }

      return migratedCount
    } catch (error) {
      console.error('Error migrating data:', error)
      throw new Error('Error al migrar datos')
    }
  }

  // Métodos privados de transformación
  private transformParcels(data: any[]): Parcel[] {
    return data.map(parcel => this.transformParcel(parcel))
  }

  private transformParcel(data: any): Parcel {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      area: data.area,
      sowingDate: new Date(data.sowing_date),
      crop: data.crop,
      soilType: data.soil_type,
      location: data.location,
      createdAt: new Date(data.created_at),
      calculations: []
    }
  }

  private transformParcelWithCalculations(data: any): Parcel {
    return {
      ...this.transformParcel(data),
      calculations: data.calculations?.map((calc: any) => ({
        id: calc.id,
        netSheet: calc.net_sheet,
        dailyVolume: calc.daily_volume,
        irrigationFrequency: calc.irrigation_frequency,
        nextIrrigation: calc.next_irrigation,
        cropStage: calc.crop_stage,
        currentKc: calc.current_kc,
        eto: calc.eto,
        calculatedAt: new Date(calc.calculated_at)
      })) || []
    }
  }

  private getEmptyCrop(): Crop {
    return {
      name: "",
      value: "",
      emoji: "",
      Kc: { inicial: 0, desarrollo: 0, media: 0, final: 0 },
      rootDepth: { min: 0, max: 0 },
      p: { min: 0, max: 0 }
    }
  }

  private getEmptySoilType(): SoilType {
    return {
      value: "",
      emoji: "",
      label: "",
      CC: 0,
      PMP: 0,
      Da: 0,
      description: ""
    }
  }
}

// Exportar instancia singleton
export const parcelService = new ParcelService()