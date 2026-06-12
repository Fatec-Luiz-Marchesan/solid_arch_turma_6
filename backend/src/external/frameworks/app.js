const express = require('express')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.static('public'))

const PetRoutes = require('../../../routers/PetRouters')
const UserRoutes = require('../../../routers/UserRouters')
const AdminRoutes = require('../../../routers/AdminRouters')
const UserRoutesV2 = require('../../../routers/UserRoutersV2')
const LocationRoutes = require('../../../routers/LocationRouters')

app.use('/locations', LocationRoutes)
const ReportRoutes = require('../../../routers/ReportRouters')

app.use('/v2/users', UserRoutesV2)

app.use('/admins', AdminRoutes)
app.use('/reports', ReportRoutes)

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)

module.exports = app