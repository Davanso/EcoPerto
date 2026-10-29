import { describe, expect, it } from 'vitest'
import { normalizeOverpass } from './normalize'

const node = {
  type: 'node',
  id: 1,
  lat: -23.55,
  lon: -46.63,
  tags: { amenity: 'recycling' },
}

describe('normalizeOverpass', () => {
  it('keeps unknown information unknown and preserves source identity', () => {
    const [point] = normalizeOverpass({ elements: [node] })
    expect(point).toMatchObject({
      id: 'osm:node:1',
      source: 'osm',
      latitude: -23.55,
      sourceUrl: 'https://www.openstreetmap.org/node/1',
    })
    expect(point.acceptedMaterials).toBeUndefined()
    expect(point.address).toBeUndefined()
    expect(point.lastVerifiedAt).toBeUndefined()
  })
  it('normalizes ways and relations, explicit materials and available details', () => {
    const way = {
      type: 'way',
      id: 2,
      center: { lat: 0, lon: 0 },
      tags: {
        amenity: 'recycling',
        name: 'Coleta',
        'recycling:paper': 'yes',
        'recycling:plastic': 'no',
        'recycling:batteries': 'yes',
        'addr:street': 'Rua A',
        'addr:housenumber': '10',
        opening_hours: 'Mo-Fr 09:00-17:00',
      },
    }
    const points = normalizeOverpass({
      elements: [way, { ...way, type: 'relation' }],
    })
    expect(points).toHaveLength(2)
    expect(points[0]).toMatchObject({
      acceptedMaterials: ['paper', 'batteries'],
      address: 'Rua A, 10',
      openingHours: 'Mo-Fr 09:00-17:00',
    })
    expect(points[0].id).not.toBe(points[1].id)
  })
  it('deduplicates same-source ids and rejects inaccessible or malformed records', () => {
    expect(
      normalizeOverpass({
        elements: [
          node,
          node,
          { ...node, id: 3, lat: 100 },
          { ...node, id: 4, tags: { amenity: 'recycling', access: 'private' } },
          { ...node, id: 5, tags: { amenity: 'cafe' } },
          null,
        ],
      }),
    ).toHaveLength(1)
  })
  it('rejects invalid and partial responses, but accepts genuine emptiness', () => {
    for (const payload of [
      null,
      {},
      { elements: 'invalid' },
      { elements: [], remark: 'runtime error: timeout' },
    ]) {
      expect(() => normalizeOverpass(payload)).toThrow()
    }
    expect(normalizeOverpass({ elements: [] })).toEqual([])
  })
})
