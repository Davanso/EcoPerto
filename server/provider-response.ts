/** Only structural metadata: never log response text, URLs with credentials, or locations. */
export async function readProviderResponse(
  response: Response,
  provider: string,
) {
  const text = (await response.text()).replace(/^\uFEFF/, '').trim()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    /* Some gateways return HTML/XML with HTTP 200. */
  }
  const format =
    data !== undefined
      ? 'json'
      : !text
        ? 'empty'
        : /<html\b/i.test(text)
          ? 'html'
          : text.startsWith('<')
            ? 'xml'
            : 'text'
  if (!response.ok || data === undefined) {
    const reason = /out of memory|memory limit|exceed.*maxsize/i.test(text)
      ? 'memory_limit'
      : /timed? ?out|timeout/i.test(text)
        ? 'timeout'
        : /parse error|syntax error|encoding error/i.test(text)
          ? 'query_error'
          : /quota|rate.?limit|daily limit/i.test(text)
            ? 'quota'
            : /unauthori[sz]ed|access.*denied|disallowed|invalid.*key/i.test(
                  text,
                )
              ? 'access_denied'
              : 'unknown'
    console.warn(
      JSON.stringify({
        event: 'provider_response_failure',
        provider,
        status: response.status,
        contentType: response.headers.get('content-type')?.split(';')[0],
        format,
        redirected: response.redirected,
        reason,
      }),
    )
  }
  return { data, format }
}

export function serverSecret(value: string | undefined) {
  return value
    ?.trim()
    .replace(/^(['"])(.*)\1$/s, '$2')
    .trim()
}
