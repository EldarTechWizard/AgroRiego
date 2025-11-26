import { createClient } from '@/lib/supabase/client'
import { CalculatedResults } from '@/types/farm'

export class CalculationService {
  private readonly supabase = createClient()

  /**
   * Obtiene todos los cálculos de una parcela
   */
  async getCalculationsByParcelId(parcelId: string): Promise<CalculatedResults[]> {
    const { data, error } = await this.supabase
      .from('calculations')
      .select('*')
      .eq('parcel_id', parcelId)
      .order('calculated_at', { ascending: false })

    if (error) {
      console.error('Error loading calculations:', error)
      throw new Error('No se pudieron cargar los cálculos')
    }

    return data.map(calc => this.transformCalculation(calc))
  }

  /**
   * Crea un nuevo cálculo
   */
  async createCalculation(
    parcelId: string,
    calculation: Omit<CalculatedResults, 'id' | 'calculatedAt'>
  ): Promise<CalculatedResults> {
    const calculationData = {
      parcel_id: parcelId,
      net_sheet: calculation.netSheet,
      daily_volume: calculation.dailyVolume,
      irrigation_frequency: calculation.irrigationFrequency,
      next_irrigation: calculation.nextIrrigation,
      root_depth: calculation.rootDepth,
      water_factor: calculation.waterFactor,
      crop_stage: calculation.cropStage,
      current_kc: calculation.currentKc,
      eto: calculation.eto
    }

    const { data, error } = await this.supabase
      .from('calculations')
      .insert(calculationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating calculation:', error)
      throw new Error('No se pudo crear el cálculo')
    }

    return this.transformCalculation(data)
  }

  /**
   * Obtiene el último cálculo de una parcela
   */
  async getLatestCalculation(parcelId: string): Promise<CalculatedResults | null> {
    const { data, error } = await this.supabase
      .from('calculations')
      .select('*')
      .eq('parcel_id', parcelId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error loading latest calculation:', error)
      return null
    }

    return this.transformCalculation(data)
  }

  /**
   * Elimina todos los cálculos de una parcela
   */
  async deleteCalculationsByParcelId(parcelId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calculations')
      .delete()
      .eq('parcel_id', parcelId)

    if (error) {
      console.error('Error deleting calculations:', error)
      throw new Error('No se pudieron eliminar los cálculos')
    }
  }

  private transformCalculation(data: any): CalculatedResults {
    return {
      id: data.id,
      netSheet: data.net_sheet,
      dailyVolume: data.daily_volume,
      waterFactor: data.water_factor,
      rootDepth: data.root_depth,
      irrigationFrequency: data.irrigation_frequency,
      nextIrrigation: data.next_irrigation,
      cropStage: data.crop_stage,
      currentKc: data.current_kc,
      eto: data.eto,
      calculatedAt: new Date(data.calculated_at)
    }
  }
}

export const calculationService = new CalculationService()