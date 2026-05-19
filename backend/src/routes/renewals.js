const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { uploadWithPdf } = require('../middleware/upload')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

const EXPIRY_FIELD = { PRB: 'prbExpiry', TAX: 'taxRenewalDate', INS: 'insExpiry', GAS: 'gasExpiry' }

function parseDateUTC(value) {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim())
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return null
}

// GET / — list renewals
router.get('/', async (req, res) => {
  try {
    const { vehicleId, type, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (type) where.type = type
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const [renewals, total] = await Promise.all([
      prisma.vehicleRenewal.findMany({
        where,
        include: {
          vehicle: { select: { id: true, type: true, licensePlate: true } },
          user: { select: { id: true, username: true, displayName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.vehicleRenewal.count({ where })
    ])
    res.json({ renewals, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — create renewal + update vehicle expiry
router.post('/', uploadWithPdf.single('document'), async (req, res) => {
  try {
    const { vehicleId, userId, type, provider, expiryDate, note } = req.body
    if (!vehicleId || !userId || !type || !expiryDate) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const expiry = parseDateUTC(expiryDate)
    if (!expiry) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' })

    const vehicleField = EXPIRY_FIELD[type]
    if (!vehicleField) return res.status(400).json({ error: 'ประเภทไม่ถูกต้อง' })

    const renewal = await prisma.vehicleRenewal.create({
      data: {
        vehicleId: Number(vehicleId),
        userId: Number(userId),
        type,
        provider: provider || null,
        expiryDate: expiry,
        documentPath: req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, `renewal-${type.toLowerCase()}-`) : null,
        note: note || null
      },
      include: {
        vehicle: { select: { id: true, type: true, licensePlate: true } },
        user: { select: { id: true, username: true, displayName: true } }
      }
    })

    await prisma.vehicle.update({
      where: { id: Number(vehicleId) },
      data: { [vehicleField]: expiry }
    })

    const typeLabel = { PRB: 'พ.ร.บ.', TAX: 'ภาษี', INS: 'ประกัน', GAS: 'แก๊ส' }[type]
    await logActivity(userId, 'RENEW', `ต่อ${typeLabel} ${renewal.vehicle.licensePlate} หมดอายุ ${expiryDate}`, 'VehicleRenewal', renewal.id)

    res.json(renewal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { actionUserId } = req.body
    const renewal = await prisma.vehicleRenewal.findUnique({
      where: { id: Number(req.params.id) },
      include: { vehicle: { select: { licensePlate: true } } }
    })
    if (!renewal) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    if (renewal.documentPath) deleteFromBlob(renewal.documentPath).catch(() => {})

    await prisma.vehicleRenewal.delete({ where: { id: Number(req.params.id) } })

    if (actionUserId) {
      const typeLabel = { PRB: 'พ.ร.บ.', TAX: 'ภาษี', INS: 'ประกัน', GAS: 'แก๊ส' }[renewal.type]
      await logActivity(actionUserId, 'DELETE', `ลบประวัติต่อ${typeLabel} ${renewal.vehicle.licensePlate}`, 'VehicleRenewal', renewal.id)
    }

    res.json({ message: 'ลบสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
