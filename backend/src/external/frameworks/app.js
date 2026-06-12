const express = require('express')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.static('public'))

const PetRoutes = require('../../../routers/PetRouters')
const UserRoutes = require('../../../routers/UserRouters')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)

module.exports = app