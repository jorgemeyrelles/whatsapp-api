const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')
const { WhatsAppInstance } = require('../class/instance')
const {
    ConnectLinkStore,
    SESSION_TTL_MS,
} = require('../helper/connectLinkStore')
const config = require('../../config/config')

const store = new ConnectLinkStore()
const COOKIE = 'wa_conectar'
const TOKEN_RE = /^[A-Za-z0-9_-]{20,100}$/

function readCookie(req, name) {
    const pair = (req.headers.cookie || '')
        .split(';')
        .map((c) => c.trim().split('='))
        .find(([k]) => k === name)
    return pair ? decodeURIComponent(pair.slice(1).join('=')) : ''
}

function noStore(res) {
    res.set({
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
    })
}

function isHttps(req) {
    return req.secure || req.headers['x-forwarded-proto'] === 'https'
}

async function getOrCreateInstance(key) {
    if (WhatsAppInstances[key]) return WhatsAppInstances[key]
    const instance = new WhatsAppInstance(key, false, null)
    await instance.init()
    WhatsAppInstances[key] = instance
    return instance
}

// POST /instance/connect-link?key=<opcional> — protegido pelo bearer como as demais rotas de gestão
exports.createLink = async (req, res) => {
    const key = req.query.key?.toString() || uuidv4()
    const instance = await getOrCreateInstance(key)
    if (instance.instance?.online) {
        return res
            .status(409)
            .json({ error: true, message: 'Instância já conectada', key })
    }
    const { token, expiresAt } = store.create(key)
    const baseUrl = config.appUrl || `${req.protocol}://${req.headers.host}`
    res.status(201).json({
        error: false,
        key,
        url: `${baseUrl}/conectar/${token}`,
        expiresAt: new Date(expiresAt).toISOString(),
    })
}

const LINK_INVALIDO =
    'Link inválido, expirado ou já utilizado. Gere um novo link.'

function sessionKey(req, token) {
    return TOKEN_RE.test(token)
        ? store.resolve(token, readCookie(req, COOKIE))
        : null
}

// GET /conectar/:token — público e sem efeito colateral (prefetch, preview e F5 não gastam o link)
exports.page = (req, res) => {
    noStore(res)
    const { token } = req.params
    const aberto = Boolean(sessionKey(req, token))
    if (!aberto && !(TOKEN_RE.test(token) && store.isClaimable(token))) {
        return res.status(410).send(LINK_INVALIDO)
    }
    const nonce = crypto.randomBytes(16).toString('base64')
    res.set({
        'Content-Security-Policy': `default-src 'none'; img-src data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; connect-src 'self'; frame-ancestors 'none'`,
        'X-Frame-Options': 'DENY',
    })
    res.render('conectar', { nonce, aberto, base: `/conectar/${token}` })
}

// POST /conectar/:token/abrir — o clique em "Mostrar QR code"; o primeiro navegador fica com o link
exports.abrir = (req, res) => {
    noStore(res)
    if (req.get('sec-fetch-site') === 'cross-site') return res.sendStatus(403)
    const { token } = req.params
    const claimed = TOKEN_RE.test(token) ? store.claim(token) : null
    if (!claimed) return res.status(410).json({ status: 'expirado' })
    res.cookie(COOKIE, claimed.session, {
        httpOnly: true,
        sameSite: 'strict',
        secure: isHttps(req),
        path: `/conectar/${token}`,
        maxAge: SESSION_TTL_MS,
    })
    return res.sendStatus(204)
}

// GET /conectar/:token/estado — consultado pela página a cada poucos segundos
exports.estado = (req, res) => {
    noStore(res)
    const { token } = req.params
    const key = sessionKey(req, token)
    const instance = key && WhatsAppInstances[key]
    if (!instance) return res.status(410).json({ status: 'expirado' })

    if (instance.instance.online) {
        store.revoke(token)
        return res.json({ status: 'conectado' })
    }
    const qr = instance.instance.qr
    if (qr === ' ') {
        // limite de QRs (INSTANCE_MAX_RETRY_QR) atingido: a instância desistiu
        store.revoke(token)
        return res.json({ status: 'esgotado' })
    }
    return res.json(qr ? { status: 'qr', qr } : { status: 'aguardando' })
}
