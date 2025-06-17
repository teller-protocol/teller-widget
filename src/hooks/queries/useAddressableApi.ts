type Property = {
  name: string
  value?: string
}

interface LogEventParams {
  eventName: string
  pageUrl: string
  properties?: Property[]
  address?: string
  chainId?: string
  extensionProvider?: string
  referrer?: string
  timestamp?: number
  timezoneName?: string
  timezoneOffset?: number
}

export function logEvent({
  eventName,
  pageUrl,
  properties = [],
  address = '',
  chainId = '',
  extensionProvider = '',
  referrer = '',
  timestamp = Math.floor(Date.now() / 1000),
  timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset = new Date().getTimezoneOffset(),
}: LogEventParams): void {
  const payload = {
    tid: 'ffe0326452604bcd8c9508eb8df3b3be',
    event_name: eventName,
    page_url: pageUrl,
    referrer,
    timestamp,
    timezone_name: timezoneName,
    timezone_offset: -timezoneOffset,
    extension_provider: extensionProvider,
    address,
    chain_id: chainId,
    properties,
  }

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')

  const img = new Image()
  img.src = `https://tag.adrsbl.io/events/prod_standard_stage/p.png?is_conversion=false&data=${encodeURIComponent(
    encoded
  )}`
}