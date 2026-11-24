const express = require('express')
const controller = require('../controllers/connect.controller')

// Rotas públicas: a proteção é o próprio link de uso único (ver connect.controller.js)
const router = express.Router()
router.get('/:token', controller.page)
router.post('/:token/abrir', controller.abrir)
router.get('/:token/estado', controller.estado)

module.exports = router
