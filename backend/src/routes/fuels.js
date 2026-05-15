const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

const PHOTO_FIELDS = [
  { name: 'mileagePhotoBefore', maxCount: 1 },
  { name: 'mileagePhotoAfter', maxCount: 1 },
  { name: 'gaugePhotoBefore', maxCount: 1 },
  { name: 'gaugePhotoAfter', maxCount: 1 },
  { name: 'pumpPhoto', maxCount: 1 },
  { name: 'receiptPhoto', maxCount: 1 }
]

const INCLUDE = {
  vehicle: { select: { id: true, type: true, licensePlate: true } },
  user: { select: { id: true, username: true, displayName: true } }
}

// GET / — list with pagination
router.get('/', async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, page = 1, limit = 100 } = req.query
    const where = {}
    if (vehicleId) {
      const ids = Array.isArray(vehicleId) ? vehicleId : vehicleId.split(',')
      const numIds = ids.map(Number).filter(Boolean)
      where.vehicleId = numIds.length === 1 ? numIds[0] : { in: numIds }
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate)   where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const [logs, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.fuelLog.count({ where })
    ])

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — create fuel log with photos
router.post('/', upload.fields(PHOTO_FIELDS), async (req, res) => {
  try {
    const { vehicleId, userId, mileageBefore, mileageAfter, liters, amount, note } = req.body
    if (!vehicleId || !userId || !mileageBefore || !liters || !amount) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const files = req.files || {}
    const data = {
      vehicleId: Number(vehicleId),
      userId: Number(userId),
      mileageBefore: parseFloat(mileageBefore),
      mileageAfter: mileageAfter ? parseFloat(mileageAfter) : null,
      liters: parseFloat(liters),
      amount: parseFloat(amount),
      note: note || null
    }

    for (const f of PHOTO_FIELDS) {
      if (files[f.name]?.[0]) {
        const file = files[f.name][0]
        data[f.name] = await uploadToBlob(file.buffer, file.originalname, `fuel-${f.name}-`)
      }
    }

    const log = await prisma.fuelLog.create({ data, include: INCLUDE })
    await logActivity(userId, 'FUEL', `เติมน้ำมัน ${log.vehicle.licensePlate} ไมล์ ${mileageBefore}→${mileageAfter || '-'} ${liters}L ${Number(amount).toLocaleString('th-TH')}฿`, 'FuelLog', log.id)
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { actionUserId } = req.body
    const log = await prisma.fuelLog.findUnique({ where: { id: Number(req.params.id) } })
    if (!log) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    for (const f of PHOTO_FIELDS) {
      if (log[f.name]) deleteFromBlob(log[f.name]).catch(() => {})
    }

    await prisma.fuelLog.delete({ where: { id: Number(req.params.id) } })
    if (actionUserId) {
      await logActivity(actionUserId, 'DELETE', `ลบประวัติการเติมน้ำมัน`, 'FuelLog', Number(req.params.id))
    }
    res.json({ message: 'ลบสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
