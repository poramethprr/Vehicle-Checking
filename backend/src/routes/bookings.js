const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob } = require('../services/azureBlob')

const BOOKING_INCLUDE = {
  vehicle: { select: { id: true, type: true, licensePlate: true, photo: true } },
  requester: { select: { id: true, username: true, displayName: true, phone: true } },
  driver: { select: { id: true, username: true, displayName: true, phone: true } },
  returnRequester: { select: { id: true, username: true, displayName: true } }
}

// Get all bookings (with filters)
router.get('/', async (req, res) => {
  try {
    const { vehicleId, status, driverId, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}

    if (vehicleId) {
      const ids = Array.isArray(vehicleId) ? vehicleId : vehicleId.split(',')
      const numIds = ids.map(Number).filter(Boolean)
      where.vehicleId = numIds.length === 1 ? numIds[0] : { in: numIds }
    }
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
        include: BOOKING_INCLUDE,
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
      include: { vehicle: true, ...BOOKING_INCLUDE }
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

// Checkout (เบิกรถ — Admin only, enforced on frontend)
router.post('/checkout', upload.single('mileageOutPhoto'), async (req, res) => {
  try {
    const { vehicleId, requesterId, driverId, destination, purpose, mileageOut } = req.body

    if (!vehicleId || !requesterId || !driverId || !destination || !mileageOut) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' })
    }

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
        mileageOutPhoto: req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'mileage-out-') : null
      },
      include: BOOKING_INCLUDE
    })

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

// Direct return (คืนรถโดยตรง — Admin only)
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

    const mileageInNum = Number(mileageIn)
    const distance = mileageInNum - existing.mileageOut

    const photoUrl = req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'mileage-in-') : null

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
        mileageIn: mileageInNum,
        mileageInPhoto: photoUrl,
        distance,
        returnNote: returnNote || null
      },
      include: BOOKING_INCLUDE
    })

    await prisma.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: 'ACTIVE', currentMileage: mileageInNum }
    })

    const uid = userId ? Number(userId) : existing.requesterId
    await logActivity(
      uid, 'RETURN_VEHICLE',
      `คืนรถ ${existing.vehicle.licensePlate} ไมล์: ${mileageInNum} ระยะทาง: ${distance} กม.`,
      'Booking', booking.id
    )

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Return request (ขอคืนรถ — Staff submits, saves pending data)
router.put('/return-request/:id', upload.single('pendingMileageInPhoto'), async (req, res) => {
  try {
    const { pendingMileageIn, pendingReturnNote, userId } = req.body
    const bookingId = Number(req.params.id)

    if (!pendingMileageIn) return res.status(400).json({ error: 'กรุณากรอกเลขไมล์ตอนคืน' })
    if (!userId) return res.status(400).json({ error: 'ไม่พบข้อมูลผู้ใช้' })

    const existing = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิก' })
    if (existing.status !== 'CHECKED_OUT') return res.status(400).json({ error: 'รถคันนี้คืนแล้ว' })

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        pendingMileageIn: Number(pendingMileageIn),
        pendingMileageInPhoto: req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'mileage-in-') : null,
        pendingReturnNote: pendingReturnNote || null,
        returnRequestedAt: new Date(),
        returnRequestedById: Number(userId)
      },
      include: BOOKING_INCLUDE
    })

    await logActivity(
      Number(userId), 'REQUEST_RETURN',
      `ขอคืนรถ ${booking.vehicle.licensePlate} ไมล์: ${pendingMileageIn}`,
      'Booking', booking.id
    )

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Approve return (อนุมัติคืน — Admin approves pending return request)
router.put('/approve-return/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const bookingId = Number(req.params.id)

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: { select: { licensePlate: true } } }
    })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิก' })
    if (existing.status !== 'CHECKED_OUT') return res.status(400).json({ error: 'รถคันนี้คืนแล้ว' })
    if (!existing.pendingMileageIn) return res.status(400).json({ error: 'ยังไม่มีคำขอคืนรถ' })

    const mileageIn = existing.pendingMileageIn
    const distance = mileageIn - existing.mileageOut

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
        mileageIn,
        mileageInPhoto: existing.pendingMileageInPhoto,
        distance,
        returnNote: existing.pendingReturnNote,
        pendingMileageIn: null,
        pendingMileageInPhoto: null,
        pendingReturnNote: null,
        returnRequestedAt: null,
        returnRequestedById: null
      },
      include: BOOKING_INCLUDE
    })

    await prisma.vehicle.update({
      where: { id: existing.vehicleId },
      data: { status: 'ACTIVE', currentMileage: mileageIn }
    })

    const uid = userId ? Number(userId) : existing.requesterId
    await logActivity(
      uid, 'RETURN_VEHICLE',
      `อนุมัติคืนรถ ${existing.vehicle.licensePlate} ไมล์: ${mileageIn} ระยะทาง: ${distance} กม.`,
      'Booking', booking.id
    )

    res.json(booking)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reject return request (Admin rejects — clears pending data)
router.put('/reject-return/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const bookingId = Number(req.params.id)

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: { select: { licensePlate: true } } }
    })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูลการเบิก' })
    if (!existing.pendingMileageIn) return res.status(400).json({ error: 'ไม่มีคำขอคืนรถ' })

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        pendingMileageIn: null,
        pendingMileageInPhoto: null,
        pendingReturnNote: null,
        returnRequestedAt: null,
        returnRequestedById: null
      },
      include: BOOKING_INCLUDE
    })

    const uid = userId ? Number(userId) : existing.requesterId
    await logActivity(
      uid, 'REJECT_RETURN',
      `ไม่อนุมัติคำขอคืนรถ ${existing.vehicle.licensePlate}`,
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
