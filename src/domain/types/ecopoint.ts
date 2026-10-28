export const MATERIALS = {
  paper: 'Papel e papelão',
  plastic: 'Plástico',
  glass: 'Vidro',
  metal: 'Metal',
  electronics: 'Eletrônicos',
  batteries: 'Pilhas e baterias',
} as const

export type Material = keyof typeof MATERIALS

/** Modelo interno: dados externos devem ser normalizados antes de chegar à UI. */
export type Ecopoint = {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  /** Ausência significa desconhecido, nunca compatibilidade confirmada. */
  acceptedMaterials?: Material[]
  openingHours?: string
  contact?: string
  source: 'osm' | 'official'
  sourceUrl?: string
  lastVerifiedAt?: string
  /** Distância aproximada em linha reta. */
  distanceMeters?: number
}
