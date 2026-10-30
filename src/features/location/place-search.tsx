import { useEffect, useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { searchPlaces, type Place } from '@/services/places/client'

export function PlaceSearch({
  onSelect,
  label = 'Cidade ou bairro',
  placeholder = 'Ex.: Campinas, SP',
  description = 'Sem precisar liberar sua localização.',
}: {
  onSelect: (place: Place) => void
  label?: string
  placeholder?: string
  description?: string
}) {
  const inputId = useId()
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setBusy(true)
    setMessage('')
    setPlaces([])
    try {
      const results = await searchPlaces(query.trim(), current.signal)
      if (controller.current !== current) return
      setPlaces(results)
      if (!results.length)
        setMessage('Localidade não encontrada. Tente incluir cidade e estado.')
    } catch (error) {
      if (!current.signal.aborted)
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível buscar. Escolha a área no mapa.',
        )
    } finally {
      if (controller.current === current) setBusy(false)
    }
  }

  return (
    <div className="place-search">
      <form onSubmit={submit}>
        <Field>
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <div className="flex gap-2">
            <Input
              id={inputId}
              placeholder={placeholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPlaces([])
                setMessage('')
              }}
              minLength={3}
              maxLength={120}
              required
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon-lg"
              disabled={busy}
              aria-label={`Buscar ${label.toLowerCase()}`}
            >
              <Search aria-hidden="true" />
            </Button>
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      </form>
      <p role="status" className="text-sm text-muted-foreground">
        {busy ? 'Buscando localidades…' : message}
      </p>
      {places.length > 0 && (
        <ul className="place-options" aria-label="Localidades encontradas">
          {places.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(place)
                  setQuery(place.name.split(',').slice(0, 2).join(','))
                  setPlaces([])
                }}
              >
                {place.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
