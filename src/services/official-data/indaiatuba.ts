import type { Ecopoint } from '../../domain/types/ecopoint.ts'
import type { Coordinates } from '../../domain/types/location.ts'
import { distanceMeters } from '../../domain/rules/distance.ts'

const sourceUrl = 'https://www.indaiatuba.sp.gov.br/urbanismo/coleta-seletiva/'
const common = {
  source: 'official',
  sourceUrl,
  openingHours: 'Todos os dias, das 07h às 19h',
  acceptedMaterials: [
    'paper',
    'plastic',
    'glass',
    'metal',
    'electronics',
    'batteries',
  ],
  lastVerifiedAt: '2026-10-29',
} satisfies Partial<Ecopoint>

/** Municipal facts consulted online; coordinates cross-checked against Abrecon's published markers. */
export const INDAIATUBA_ECOPOINTS: Ecopoint[] = [
  {
    ...common,
    id: 'official:indaiatuba:eldorado',
    name: 'Ecoponto Quintal — Jardim Eldorado',
    address:
      'Rua Reverendo Eliseu Narciso, 709, esquina com Rua do Badin — Indaiatuba, SP',
    latitude: -23.1077651,
    longitude: -47.2083321,
    coordinateSourceUrl: 'https://mapa.abrecon.org.br/ecoponto/750/jd-eldorado',
  },
  {
    ...common,
    id: 'official:indaiatuba:olinda',
    name: 'Ecoponto Jardim Olinda',
    address: 'Rua Valdir Ferrari, 104, esquina com Rua Tamoio — Indaiatuba, SP',
    latitude: -23.0771982,
    longitude: -47.1938085,
    coordinateSourceUrl: 'https://mapa.abrecon.org.br/ecoponto/752/jd-olinda',
  },
  {
    ...common,
    id: 'official:indaiatuba:joao-pioli',
    name: 'Ecoponto João Pioli',
    address:
      'Avenida Artes e Ofícios, 237, esquina com Avenida Manoel Ruz Peres — Indaiatuba, SP',
    latitude: -23.1075876,
    longitude: -47.240296,
    coordinateSourceUrl: 'https://mapa.abrecon.org.br/ecoponto/749/joao-pioli',
  },
  {
    ...common,
    id: 'official:indaiatuba:nova-veneza',
    name: 'Ecoponto Jardim Nova Veneza',
    address:
      'Rua Padre Arthur Lupurini Sampaio, 51, esquina com Rua José Vilalta — Indaiatuba, SP',
    latitude: -23.0954732,
    longitude: -47.2475488,
    coordinateSourceUrl: 'https://mapa.abrecon.org.br/ecoponto/751/nova-veneza',
  },
]

export function searchOfficialPoints(
  center: Coordinates,
  radius: number,
): Ecopoint[] {
  return INDAIATUBA_ECOPOINTS.filter(
    (point) => distanceMeters(center, point) <= radius,
  )
}
