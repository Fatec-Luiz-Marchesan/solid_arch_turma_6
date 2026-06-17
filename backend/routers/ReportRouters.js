/**
 * Rotas de Report - Como fizemos uma página de reports, ela tem que ter a rota dela!
 * Ou você não entendeu ainda como funciona o MVC e o React?
 *
 * POST   /reports            - cria um reporte (autenticado)
 * GET    /reports            - lista reportes com filtros opcionais (autenticado)
 * Metodo POST/GET você tem que pelo menos entender isso! Me diga que o professor Icoma não 
 * usou tanto o POSTMAN pra nada?
 * PATCH  /reports/:id/status - atualiza o status de um reporte (autenticado)
 */

const router = require('express').Router()

const ReportController = require('../controllers/ReportController')
const verifyToken      = require('../helpers/check-token')

router.post('/',              verifyToken, ReportController.create)
router.get('/',               verifyToken, ReportController.getAll)
router.patch('/:id/status',   verifyToken, ReportController.updateStatus)

module.exports = router
