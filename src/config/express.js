const express = require('express')
const path = require('path')
const exceptionHandler = require('express-exception-handler')
exceptionHandler.handle()
const app = express()
const error = require('../api/middlewares/error')
const tokenCheck = require('../api/middlewares/tokenCheck')
const { protectRoutes } = require('./config')

app.use(express.json())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../api/views'))
global.WhatsAppInstances = {}

const routes = require('../api/routes/')
const connectRoutes = require('../api/routes/connect.route')

app.disable('x-powered-by')
// Página de conexão por link de uso único: pública, montada antes do bearer
app.use('/conectar', connectRoutes)

if (protectRoutes) {
    app.use(tokenCheck)
}
app.use('/', routes)
app.use(error.handler)

module.exports = app
