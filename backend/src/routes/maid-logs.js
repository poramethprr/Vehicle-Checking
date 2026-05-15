const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob } = require('../services/azureBlob')

const include = {
  area: true,
  user: { select: { id: true, username: true, displayName: true } }
}

router.get('/', async (req, res) => {
  try {
    const { areaId, userId, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}
    if (areaId) where.areaId = Number(areaId)
    if (userId) where.userId = Number(userId)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }
    const [logs, total] = await Promise.all([
      prisma.cleaningLog.findMany({
        where, include,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.cleaningLog.count({ where })
    ])
    res.json({ logs, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { areaId, userId, note } = req.body
    if (!areaId || !userId) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })
    const area = await prisma.cleaningArea.findUnique({ where: { id: Number(areaId) } })
    if (!area) return res.status(404).json({ error: 'ไม่พบพื้นที่' })
    const photo = req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'maid-log-') : null
    const log = await prisma.cleaningLog.create({
      data: { areaId: Number(areaId), userId: Number(userId), photo, note },
      include
    })
    await logActivity(Number(userId), 'CREATE', `บันทึกการทำความสะอาด ${area.name}`, 'CleaningLog', log.id)
    res.json(log)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const log = await prisma.cleaningLog.findUnique({ where: { id: Number(req.params.id) } })
    if (!log) return res.status(404).json({ error: 'ไม่พบบันทึก' })
    await prisma.cleaningLog.delete({ where: { id: Number(req.params.id) } })
    if (userId) await logActivity(Number(userId), 'DELETE', `ลบบันทึกการทำความสะอาด`, 'CleaningLog', log.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
