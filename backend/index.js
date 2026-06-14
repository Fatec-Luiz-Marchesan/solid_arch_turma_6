const express = require('express')
const cors = require('cors')

const app = express()

// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Public folder for images
app.use(express.static('public'))

// Routes
const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')
const MessageRoutes = require('./routers/MessageRouters')
const PaymentRoutes = require('./routers/PaymentRouters')
const SettingsRoutes = require('./routers/SettingsRouters')
const UserAccountRoutes = require('./routers/UserAccountRouters')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)
app.use('/messages', MessageRoutes)
app.use('/payments', PaymentRoutes)
app.use('/settings', SettingsRoutes)
app.use('/user', UserAccountRoutes)

app.listen(5000)

const NotificationRoutes = require('./routers/NotificationRouters');

app.use('/notifications', NotificationRoutes);