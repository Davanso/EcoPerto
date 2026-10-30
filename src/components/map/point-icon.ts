import { divIcon } from 'leaflet'

export function createPointIcon(
  label: number | 'A',
  { selected = false, origin = false } = {},
) {
  return divIcon({
    className: `ecopoint-marker${selected ? ' is-selected' : ''}${origin ? ' is-origin' : ''}`,
    html: `<span class="ecopoint-marker-body" aria-hidden="true"><span>${label}</span></span>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -44],
  })
}
