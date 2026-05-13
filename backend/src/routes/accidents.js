const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `accident-${Date.now()}-${file.fieldname}-${Math.random().toString(36).slice(2, 6)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(path.extname(file.originalname))) cb(null, true)
    else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ'))
  }
})

const PHOTO_FIELDS = [
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
  { name: 'photo4', maxCount: 1 },
  { name: 'photo5', maxCount: 1 },
  { name: 'photo6', maxCount: 1 }
]

const INCLUDE = {
  vehicle: { select: { id: true, type: true, licensePlate: true } },
  user: { select: { id: true, username: true, displayName: true } }
}

// GET / — list with pagination
router.get('/', async (req, res) => {
  try {
    const { vehicleId, page = 1, limit = 10 } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)

    const [reports, total] = await Promise.all([
      prisma.accidentReport.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.accidentReport.count({ where })
    ])

    res.json({ reports, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — create accident report with photos
router.post('/', upload.fields(PHOTO_FIELDS), async (req, res) => {
  try {
    const { vehicleId, userId, location, damagedParts, detail, note } = req.body
    if (!vehicleId || !userId || !location || !damagedParts) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const files = req.files || {}
    const data = {
      vehicleId: Number(vehicleId),
      userId: Number(userId),
      location,
      damagedParts,
      detail: detail || null,
      note: note || null
    }

    for (const f of PHOTO_FIELDS) {
      if (files[f.name]?.[0]) data[f.name] = files[f.name][0].filename
    }

    const report = await prisma.accidentReport.create({ data, include: INCLUDE })
    await logActivity(userId, 'ACCIDENT', `รายงานอุบัติเหตุ ${report.vehicle.licensePlate} ที่ ${location}`, 'AccidentReport', report.id)
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { actionUserId } = req.body
    const report = await prisma.accidentReport.findUnique({ where: { id: Number(req.params.id) } })
    if (!report) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    for (const f of PHOTO_FIELDS) {
      if (report[f.name]) {
        const p = path.join(uploadDir, report[f.name])
        if (fs.existsSync(p)) fs.unlinkSync(p)
      }
    }

    await prisma.accidentReport.delete({ where: { id: Number(req.params.id) } })
    if (actionUserId) {
      await logActivity(actionUserId, 'DELETE', `ลบรายงานอุบัติเหตุ`, 'AccidentReport', Number(req.params.id))
    }
    res.json({ message: 'ลบสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
