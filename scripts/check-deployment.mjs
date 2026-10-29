const base = new URL(process.argv[2] || 'http://localhost:5173')
if (!['http:', 'https:'].includes(base.protocol))
  throw new Error('Provide an HTTP(S) deployment URL.')

const checks = [
  {
    path: '/api/ecopoints?lat=-23.091&lon=-47.218&radius=5000',
    valid: (body) => body.freshness === 'official' && body.points?.length === 4,
  },
  {
    path: '/api/places?q=Indaiatuba%2C%20SP',
    valid: (body) =>
      body.places?.some((place) => place.name.includes('Indaiatuba')),
  },
]

let failed = false
for (const check of checks) {
  const start = Date.now()
  try {
    const response = await fetch(new URL(check.path, base), {
      signal: AbortSignal.timeout(15000),
    })
    const body = await response.json()
    const ok = response.ok && check.valid(body)
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${check.path.split('?')[0]} HTTP ${response.status} ${Date.now() - start}ms${body.code ? ` ${body.code}` : ''}`,
    )
    if (!ok) failed = true
  } catch (error) {
    failed = true
    console.log(`FAIL ${check.path.split('?')[0]} ${error.message}`)
  }
}
if (failed) process.exitCode = 1
