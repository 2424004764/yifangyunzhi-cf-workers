// JWT 签名和验证 (HS256, Web Crypto API)

const EXPIRES_IN = 60 * 60 * 24 * 7 // 7天

function base64url(data: string): string {
	return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function signToken(payload: Record<string, unknown>, secret: string) {
	const exp = Math.floor(Date.now() / 1000) + EXPIRES_IN
	const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
	const body = base64url(JSON.stringify({ ...payload, exp }))
	const data = `${header}.${body}`

	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	)

	const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
	const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
		.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

	return { token: `${data}.${sig}`, exp }
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown>> {
	const parts = token.split('.')
	if (parts.length !== 3) throw new Error('invalid token')

	const [header, payload, sig] = parts
	if (!header || !payload || !sig) throw new Error('invalid token')
	const data = `${header}.${payload}`

	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['verify']
	)

	const sigBytes = Uint8Array.from(
		atob(sig.replace(/-/g, '+').replace(/_/g, '/')),
		(c) => c.charCodeAt(0)
	)

	const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data))
	if (!valid) throw new Error('invalid signature')

	const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>

	if (decoded.exp && typeof decoded.exp === 'number') {
		if (Math.floor(Date.now() / 1000) > decoded.exp) {
			throw new Error('token expired')
		}
	}

	return decoded
}
