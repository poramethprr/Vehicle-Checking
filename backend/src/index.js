require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const vehicleRoutes = require('./routes/vehicles')
const inspectionRoutes = require('./routes/inspections')
const userRoutes = require('./routes/users')
const logRoutes = require('./routes/logs')
const exportRoutes = require('./routes/export')
const bookingRoutes = require('./routes/bookings')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/users', userRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/bookings', bookingRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const HOST = process.env.HOST || '0.0.0.0'

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})
