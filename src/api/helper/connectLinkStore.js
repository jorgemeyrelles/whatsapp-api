const crypto = require('crypto')

const CLAIM_TTL_MS = 5 * 60 * 1000 // prazo para abrir o link
const SESSION_TTL_MS = 10 * 60 * 1000 // prazo para escanear depois de aberto

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex')

function sameSecret(a, b) {
    const x = Buffer.from(String(a))
    const y = Buffer.from(String(b))
    return x.length === y.length && crypto.timingSafeEqual(x, y)
}

// Links de conexão de uso único. Fica em memória: o app roda em um processo só (ADR 0001)
// e um link perdido num restart é só gerar outro. O token em claro nunca é guardado.
class ConnectLinkStore {
    constructor({ now = Date.now } = {}) {
        this.now = now
        this.links = new Map()
    }

    create(key) {
        this.prune()
        const token = crypto.randomBytes(32).toString('base64url')
        const expiresAt = this.now() + CLAIM_TTL_MS
        this.links.set(hash(token), { key, expiresAt, session: null })
        return { token, expiresAt }
    }

    // Só consulta, sem efeito colateral: GET/HEAD de prefetch ou preview não podem gastar o link.
    isClaimable(token) {
        const link = this.links.get(hash(token))
        return Boolean(link && !link.session && link.expiresAt >= this.now())
    }

    // Primeiro navegador que pede o QR (POST) fica com o link; os demais recebem null.
    claim(token) {
        const link = this.links.get(hash(token))
        if (!link || link.session || link.expiresAt < this.now()) return null
        link.session = crypto.randomBytes(24).toString('base64url')
        link.expiresAt = this.now() + SESSION_TTL_MS
        return { key: link.key, session: link.session }
    }

    resolve(token, session) {
        const link = this.links.get(hash(token))
        if (!link || !link.session || link.expiresAt < this.now()) return null
        return sameSecret(link.session, session) ? link.key : null
    }

    revoke(token) {
        this.links.delete(hash(token))
    }

    prune() {
        const now = this.now()
        for (const [id, link] of this.links) {
            if (link.expiresAt < now) this.links.delete(id)
        }
    }
}

module.exports = { ConnectLinkStore, CLAIM_TTL_MS, SESSION_TTL_MS }
