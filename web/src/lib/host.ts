// The landing and the space live on different subdomains in prod
// (accessart.net vs space.accessart.net); everywhere else (localhost, dev)
// the space is a path on the same host.

export function isSpaceHost(): boolean {
  return window.location.hostname === 'space.accessart.net'
}

export function spaceHref(): string {
  const h = window.location.hostname
  if (h === 'accessart.net' || h === 'www.accessart.net') return 'https://space.accessart.net'
  if (isSpaceHost()) return '/'
  return '/space'
}

export function landingHref(): string {
  if (isSpaceHost()) return 'https://accessart.net'
  return '/'
}

export function goToSpace(navigate: (path: string) => void): void {
  const target = spaceHref()
  if (target.startsWith('http')) {
    window.location.assign(target)
  } else {
    navigate(target)
  }
}
