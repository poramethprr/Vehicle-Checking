const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob } = require('../services/azureBlob')

const include = {
  area: true,
  user: { select: { id: true, username: true, displayName: true } },
  resolver: { select: { id: true, username: true, displayName: true } }
}

router.get('/', async (req, res) => {
  try {
    const { areaId, status, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}
    if (areaId) where.areaId = Number(areaId)
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }
    const [issues, total] = await Promise.all([
      prisma.cleaningIssue.findMany({
        where, include,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.cleaningIssue.count({ where })
    ])
    res.json({ issues, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', upload.fields([
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 }
]), async (req, res) => {
  try {
    const { areaId, userId, title, description } = req.body
    if (!areaId || !userId || !title) return res.status(400).json({ error: 'ข้อมูลไม่ครบ' })
    const files = req.files || {}
    const issue = await prisma.cleaningIssue.create({
      data: {
        areaId: Number(areaId), userId: Number(userId), title, description,
        photo1: files.photo1?.[0] ? await uploadToBlob(files.photo1[0].buffer, files.photo1[0].originalname, 'maid-issue-') : null,
        photo2: files.photo2?.[0] ? await uploadToBlob(files.photo2[0].buffer, files.photo2[0].originalname, 'maid-issue-') : null,
        photo3: files.photo3?.[0] ? await uploadToBlob(files.photo3[0].buffer, files.photo3[0].originalname, 'maid-issue-') : null,
      },
      include
    })
    await logActivity(Number(userId), 'CREATE', `แจ้งปัญหา "${title}" ที่ ${issue.area.name}`, 'CleaningIssue', issue.id)
    res.json(issue)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', async (req, res) => {
  try {
    const { status, resolvedById, resolverNote, userId } = req.body
    const data = { status }
    if (status === 'RESOLVED') {
      data.resolvedById = resolvedById ? Number(resolvedById) : null
      data.resolverNote = resolverNote || null
      data.resolvedAt = new Date()
    } else if (status === 'OPEN' || status === 'IN_PROGRESS') {
      data.resolvedById = null
      data.resolvedAt = null
      data.resolverNote = null
    }
    const issue = await prisma.cleaningIssue.update({
      where: { id: Number(req.params.id) }, data, include
    })
    if (userId) await logActivity(Number(userId), 'UPDATE', `อัปเดตสถานะปัญหา "${issue.title}"`, 'CleaningIssue', issue.id)
    res.json(issue)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const issue = await prisma.cleaningIssue.findUnique({ where: { id: Number(req.params.id) } })
    if (!issue) return res.status(404).json({ error: 'ไม่พบปัญหา' })
    await prisma.cleaningIssue.delete({ where: { id: Number(req.params.id) } })
    if (userId) await logActivity(Number(userId), 'DELETE', `ลบปัญหา "${issue.title}"`, 'CleaningIssue', issue.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
