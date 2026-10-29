import { type Ecopoint, type Material } from '../../domain/types/ecopoint.ts'
import { isCoordinates } from '../../domain/types/location.ts'

const materialTags: Record<Material, string[]> = {
  paper: ['paper', 'cardboard'],
  plastic: ['plastic', 'plastic_packaging', 'plastic_bottles'],
  glass: ['glass', 'glass_bottles'],
  metal: ['metal', 'scrap_metal', 'cans', 'aluminium'],
  electronics: ['electrical_items', 'small_appliances', 'computers'],
  batteries: ['batteries', 'car_batteries'],
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Reject malformed envelopes and partial responses instead of reporting false emptiness. */
export function normalizeOverpass(payload: unknown): Ecopoint[] {
  if (!record(payload) || !Array.isArray(payload.elements) || payload.remark) {
    throw new Error(
      'Resposta incompleta ou inválida do serviço de pontos de coleta.',
    )
  }
  const points = new Map<string, Ecopoint>()
  for (const element of payload.elements) {
    if (!record(element) || !record(element.tags)) continue
    const tags = Object.fromEntries(
      Object.entries(element.tags).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    )
    if (tags.amenity !== 'recycling' || ['private', 'no'].includes(tags.access))
      continue
    if (
      !['node', 'way', 'relation'].includes(String(element.type)) ||
      !Number.isSafeInteger(element.id) ||
      Number(element.id) <= 0
    )
      continue
    const position = element.type === 'node' ? element : element.center
    if (
      !record(position) ||
      typeof position.lat !== 'number' ||
      typeof position.lon !== 'number'
    )
      continue
    const coordinates = { latitude: position.lat, longitude: position.lon }
    if (!isCoordinates(coordinates)) continue
    const materials = (Object.entries(materialTags) as [Material, string[]][])
      .filter(([, keys]) =>
        keys.some((key) => tags[`recycling:${key}`] === 'yes'),
      )
      .map(([material]) => material)
    const street = [tags['addr:street'], tags['addr:housenumber']]
      .filter(Boolean)
      .join(', ')
    const address =
      tags['addr:full'] ||
      [street, tags['addr:suburb'], tags['addr:city']]
        .filter(Boolean)
        .join(' — ') ||
      undefined
    const id = `osm:${element.type}:${element.id}`
    points.set(id, {
      id,
      ...coordinates,
      name: tags.name || 'Ponto de coleta sem nome informado',
      address,
      acceptedMaterials: materials.length ? materials : undefined,
      openingHours: tags.opening_hours,
      contact: tags['contact:phone'] || tags.phone,
      source: 'osm',
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      lastVerifiedAt: tags.check_date,
    })
  }
  return [...points.values()]
}
