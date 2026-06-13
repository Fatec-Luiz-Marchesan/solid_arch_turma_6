const router = require('express').Router()
const ReportController = require('../src/adapters/controllers/ReportController')

router.post('/create', ReportController.create)
router.get('/', ReportController.getAll)

module.exports = router