const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')

// Custom multer: accept images + PDF
const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `renewal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i
    if (allowed.test(path.extname(file.originalname))) cb(null, true)
    else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพและ PDF'))
  }
})

// vehicle field ที่ต้องอัพเดทตาม type
const EXPIRY_FIELD = { PRB: 'prbExpiry', TAX: 'taxRenewalDate', INS: 'insExpiry' }

function parseDateUTC(value) {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim())
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return null
}

// GET / — list renewals
router.get('/', async (req, res) => {
  try {
    const { vehicleId, type, page = 1, limit = 50 } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (type) where.type = type

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
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { vehicleId, userId, type, provider, expiryDate, note } = req.body
    if (!vehicleId || !userId || !type || !expiryDate) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const expiry = parseDateUTC(expiryDate)
    if (!expiry) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' })

    const vehicleField = EXPIRY_FIELD[type]
    if (!vehicleField) return res.status(400).json({ error: 'ประเภทไม่ถูกต้อง' })

    // Create renewal record
    const renewal = await prisma.vehicleRenewal.create({
      data: {
        vehicleId: Number(vehicleId),
        userId: Number(userId),
        type,
        provider: provider || null,
        expiryDate: expiry,
        documentPath: req.file ? req.file.filename : null,
        note: note || null
      },
      include: {
        vehicle: { select: { id: true, type: true, licensePlate: true } },
        user: { select: { id: true, username: true, displayName: true } }
      }
    })

    // Update vehicle expiry field
    await prisma.vehicle.update({
      where: { id: Number(vehicleId) },
      data: { [vehicleField]: expiry }
    })

    const typeLabel = { PRB: 'พ.ร.บ.', TAX: 'ภาษี', INS: 'ประกัน' }[type]
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

    // Delete file if exists
    if (renewal.documentPath) {
      const filePath = path.join(uploadDir, renewal.documentPath)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await prisma.vehicleRenewal.delete({ where: { id: Number(req.params.id) } })

    if (actionUserId) {
      const typeLabel = { PRB: 'พ.ร.บ.', TAX: 'ภาษี', INS: 'ประกัน' }[renewal.type]
      await logActivity(actionUserId, 'DELETE', `ลบประวัติต่อ${typeLabel} ${renewal.vehicle.licensePlate}`, 'VehicleRenewal', renewal.id)
    }

    res.json({ message: 'ลบสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
