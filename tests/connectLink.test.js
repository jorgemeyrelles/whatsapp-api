const assert = require('assert')
const request = require('supertest')
const { ConnectLinkStore } = require('../src/api/helper/connectLinkStore')

const QR = 'data:image/png;base64,AAAA'

function fakeInstance({ qr = QR, online = false } = {}) {
    return { instance: { qr, online } }
}

describe('ConnectLinkStore (link de conexão de uso único)', () => {
    it('cria token opaco e não guarda o token em claro', () => {
        const store = new ConnectLinkStore({ now: () => 0 })
        const { token, expiresAt } = store.create('inst1')
        assert.ok(token.length >= 40)
        assert.strictEqual(expiresAt, 5 * 60 * 1000)
        assert.ok(![...store.links.keys()].includes(token))
    })

    it('é de uso único: o primeiro navegador reivindica, o segundo é recusado', () => {
        const store = new ConnectLinkStore({ now: () => 0 })
        const { token } = store.create('inst1')
        const first = store.claim(token)
        assert.strictEqual(first.key, 'inst1')
        assert.ok(first.session)
        assert.strictEqual(store.claim(token), null)
        assert.strictEqual(store.resolve(token, first.session), 'inst1')
        assert.strictEqual(store.resolve(token, 'outra-sessao'), null)
    })

    it('expira se não for aberto em 5 minutos', () => {
        let t = 0
        const store = new ConnectLinkStore({ now: () => t })
        const { token } = store.create('inst1')
        t = 5 * 60 * 1000 + 1
        assert.strictEqual(store.claim(token), null)
    })

    it('sessão reivindicada vale 10 minutos e some ao revogar', () => {
        let t = 0
        const store = new ConnectLinkStore({ now: () => t })
        const { token } = store.create('inst1')
        const { session } = store.claim(token)
        t = 9 * 60 * 1000
        assert.strictEqual(store.resolve(token, session), 'inst1')
        store.revoke(token)
        assert.strictEqual(store.resolve(token, session), null)
    })
})

describe('Rotas de conexão por link', () => {
    let app
    before(() => {
        app = require('../src/config/express')
    })
    afterEach(() => {
        delete global.WhatsAppInstances.teste
    })

    async function novoLink(instancia = fakeInstance()) {
        global.WhatsAppInstances.teste = instancia
        const res = await request(app)
            .post('/instance/connect-link?key=teste')
            .set('Authorization', `Bearer ${process.env.TOKEN || ''}`)
            .expect(201)
        return res.body
    }

    it('POST /instance/connect-link devolve URL pública com validade', async () => {
        const body = await novoLink()
        assert.match(
            body.url,
            /^https?:\/\/[^/]+\/conectar\/[A-Za-z0-9_-]{40,}$/
        )
        assert.ok(body.expiresAt)
        assert.strictEqual(body.key, 'teste')
    })

    it('abrir a página não gasta o link (prefetch, preview e F5 são inofensivos)', async () => {
        const { url } = await novoLink()
        const path = new URL(url).pathname
        await request(app).head(path).expect(200)
        const res = await request(app).get(path).expect(200)
        assert.match(res.headers['content-type'], /html/)
        assert.match(res.headers['cache-control'], /no-store/)
        assert.strictEqual(res.headers['referrer-policy'], 'no-referrer')
        assert.strictEqual(res.headers['set-cookie'], undefined)
        await request(app).get(path).expect(200)
    })

    it('POST /abrir reivindica o link uma vez só e marca a sessão', async () => {
        const { url } = await novoLink()
        const path = new URL(url).pathname
        const res = await request(app).post(`${path}/abrir`).expect(204)
        assert.match(res.headers['set-cookie'][0], /HttpOnly/)
        assert.match(res.headers['set-cookie'][0], /SameSite=Strict/)
        await request(app).post(`${path}/abrir`).expect(410)
        await request(app).get(path).expect(410)
    })

    it('POST /abrir vindo de outro site é recusado', async () => {
        const { url } = await novoLink()
        const path = new URL(url).pathname
        await request(app)
            .post(`${path}/abrir`)
            .set('Sec-Fetch-Site', 'cross-site')
            .expect(403)
        await request(app).post(`${path}/abrir`).expect(204)
    })

    it('estado devolve o QR atual e, ao conectar, invalida o link', async () => {
        const inst = fakeInstance()
        const { url } = await novoLink(inst)
        const path = new URL(url).pathname
        const agent = request.agent(app)
        await agent.get(path).expect(200)
        await agent.post(`${path}/abrir`).expect(204)
        await agent.get(path).expect(200) // F5 de quem já abriu continua funcionando

        const r1 = await agent.get(`${path}/estado`).expect(200)
        assert.deepStrictEqual(r1.body, { status: 'qr', qr: QR })

        inst.instance.online = true
        const r2 = await agent.get(`${path}/estado`).expect(200)
        assert.deepStrictEqual(r2.body, { status: 'conectado' })
        await agent.get(`${path}/estado`).expect(410)
    })

    it('estado sem o cookie da sessão é recusado', async () => {
        const { url } = await novoLink()
        const path = new URL(url).pathname
        await request(app).post(`${path}/abrir`).expect(204)
        await request(app).get(`${path}/estado`).expect(410)
    })

    it('token inexistente devolve 410 sem revelar nada', async () => {
        await request(app).get('/conectar/naoexiste/estado').expect(410)
    })
})
