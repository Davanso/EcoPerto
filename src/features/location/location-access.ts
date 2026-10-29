export type LocationAccess =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'policy-blocked'
  | 'unsupported'
  | 'insecure'

export function locationPolicyError():
  | Exclude<LocationAccess, 'unknown' | 'prompt' | 'granted' | 'denied'>
  | undefined {
  if (!window.isSecureContext) return 'insecure'
  if (!navigator.geolocation) return 'unsupported'
  const policy =
    typeof document === 'undefined'
      ? undefined
      : (
          document as Document & {
            featurePolicy?: { allowsFeature: (name: string) => boolean }
          }
        ).featurePolicy
  if (policy && !policy.allowsFeature('geolocation')) return 'policy-blocked'
}

export async function readLocationAccess(): Promise<LocationAccess> {
  const issue = locationPolicyError()
  if (issue) return issue
  try {
    return navigator.permissions
      ? (await navigator.permissions.query({ name: 'geolocation' })).state
      : 'unknown'
  } catch {
    return 'unknown'
  }
}

export const LOCATION_ACCESS_MESSAGES: Record<LocationAccess, string> = {
  unknown:
    'Sua posição ainda não foi obtida. Use o botão para solicitar a localização.',
  prompt:
    'O navegador ainda precisa da sua permissão para compartilhar a localização.',
  granted:
    'Permissão de localização concedida. Use o botão para obter a posição do dispositivo.',
  denied:
    'Localização bloqueada para este site. Libere a permissão no ícone ao lado do endereço do navegador ou busque por cidade.',
  'policy-blocked':
    'Este navegador incorporado bloqueia a localização. Abra o endereço em uma aba normal do Chrome, Edge ou Safari, ou busque por cidade.',
  unsupported:
    'Este navegador não oferece acesso à localização. Busque por cidade.',
  insecure:
    'A localização exige HTTPS ou localhost. Abra a versão HTTPS ou busque por cidade.',
}
