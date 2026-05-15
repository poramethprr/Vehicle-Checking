const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

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
    const { vehicleId, startDate, endDate, page = 1, limit = 10 } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

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
      if (files[f.name]?.[0]) {
        const file = files[f.name][0]
        data[f.name] = await uploadToBlob(file.buffer, file.originalname, `accident-${f.name}-`)
      }
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
      if (report[f.name]) deleteFromBlob(report[f.name]).catch(() => {})
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
