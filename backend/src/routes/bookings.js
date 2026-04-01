const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const upload = require('../middleware/upload')

// Get all bookings (with filters)
router.get('/', async (req, res) => {
  try {
    const { vehicleId, status, driverId, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}

    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (status) where.status = status
    if (driverId) where.driverId = Number(driverId)

    if (startDate || endDate) {
      where.checkoutDate = {}
      if (startDate) where.checkoutDate.gte = new Date(startDate)
      if (endDate) where.checkoutDate.lte = new Date(endDate + 'T23:59:59')
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          vehicle: { select: { id: true, type: true, licensePlate: true } },
          requester: { select: { id: true, username: true, phone: true } },
          driver: { select: { id: true, username: true, phone: true } }
        },
        orderBy: { checkoutDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.booking.count({ where })
    ])

    res.json({ bookings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        vehicle: true,
        requester: { select: { id: true, username: true, phone: true } },
        driver: { select: { id: true, username: true, phone: true } }
      }
    })
    if (!booking) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิกรถ' })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get available vehicles (status = ACTIVE only)
router.get('/available/vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { licensePlate: 'asc' }
    })
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Checkout (เบิกรถ)
router.post('/checkout', upload.single('mileageOutPhoto'), async (req, res) => {
  try {
    const { vehicleId, requesterId, driverId, destination, purpose, mileageOut } = req.body

    if (!vehicleId || !requesterId || !driverId || !destination || !mileageOut) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' })
    }

    // Check if vehicle is already checked out
    const activeBooking = await prisma.booking.findFirst({
      where: { vehicleId: Number(vehicleId), status: 'CHECKED_OUT' }
    })
    if (activeBooking) return res.status(400).json({ error: 'รถคันนี้ถูกเบิกไปแล้ว ยังไม่ได้คืน' })

    const booking = await prisma.booking.create({
      data: {
        vehicleId: Number(vehicleId),
        requesterId: Number(requesterId),
        driverId: Number(driverId),
        destination,
        purpose: purpose || null,
        mileageOut: Number(mileageOut),
        mileageOutPhoto: req.file ? `/uploads/${req.file.filename}` : null
      },
      include: {
        vehicle: { select: { type: true, licensePlate: true } },
        driver: { select: { username: true } }
      }
    })

    // Update vehicle: set IN_USE + update mileage
    await prisma.vehicle.update({
      where: { id: Number(vehicleId) },
      data: { status: 'IN_USE', currentMileage: Number(mileageOut) }
    })

    await logActivity(
      Number(requesterId), 'CHECKOUT_VEHICLE',
      `เบิกรถ ${booking.vehicle.licensePlate} ไป ${destination} คนขับ: ${booking.driver.username} ไมล์: ${mileageOut}`,
      'Booking', booking.id
    )

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Return (คืนรถ)
router.put('/return/:id', upload.single('mileageInPhoto'), async (req, res) => {
  try {
    const { mileageIn, returnNote, userId } = req.body
    const bookingId = Number(req.params.id)

    if (!mileageIn) return res.status(400).json({ error: 'กรุณากรอกเลขไมล์ตอนคืน' })

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: { select: { licensePlate: true } } }
    })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิก' })
    if (existing.status !== 'CHECKED_OUT') return res.status(400).json({ error: 'รถคันนี้คืนแล้ว' })

    const distance = Number(mileageIn) - existing.mileageOut

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
        mileageIn: Number(mileageIn),
        mileageInPhoto: req.file ? `/uploads/${req.file.filename}` : null,
        distance,
        returnNote: returnNote || null
      },
      include: {
        vehicle: { select: { type: true, licensePlate: true } },
        requester: { select: { username: true } },
        driver: { select: { username: true } }
      }
    })

    // Update vehicle: back to ACTIVE + update mileage
    await prisma.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: 'ACTIVE', currentMileage: Number(mileageIn) }
    })

    const uid = userId ? Number(userId) : existing.requesterId
    await logActivity(
      uid, 'RETURN_VEHICLE',
      `คืนรถ ${booking.vehicle.licensePlate} ไมล์: ${mileageIn} ระยะทาง: ${distance} กม.`,
      'Booking', booking.id
    )

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Cancel booking
router.put('/cancel/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const existing = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิก' })

    const booking = await prisma.booking.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CANCELLED' },
      include: { vehicle: { select: { licensePlate: true } } }
    })

    // Return vehicle status to ACTIVE
    await prisma.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: 'ACTIVE' }
    })

    if (userId) {
      await logActivity(Number(userId), 'CANCEL_BOOKING', `ยกเลิกการเบิกรถ ${booking.vehicle.licensePlate}`, 'Booking', booking.id)
    }

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
