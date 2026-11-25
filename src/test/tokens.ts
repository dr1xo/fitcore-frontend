// Arma un token con la forma de un JWT (solo para tests: la firma es falsa).
export function fakeToken(expiresInSeconds = 3600): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: '1', exp })}.firma`
}
