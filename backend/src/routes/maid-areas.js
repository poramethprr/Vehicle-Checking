const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob } = require('../services/azureBlob')

router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query
    const where = {}
    if (isActive !== undefined) where.isActive = isActive === 'true'
    const areas = await prisma.cleaningArea.findMany({
      where,
      include: { _count: { select: { logs: true, issues: true } } },
      orderBy: { name: 'asc' }
    })
    res.json(areas)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', async (req, res) => {
  try {
    const area = await prisma.cleaningArea.findUnique({
      where: { id: Number(req.params.id) },
      include: { _count: { select: { logs: true, issues: true } } }
    })
    if (!area) return res.status(404).json({ error: 'ไม่พบพื้นที่' })
    res.json(area)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, location, description, userId } = req.body
    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อพื้นที่' })
    let photo = null
    if (req.file) photo = await uploadToBlob(req.file.buffer, req.file.originalname, 'maid-area-')
    const area = await prisma.cleaningArea.create({ data: { name, location, description, photo } })
    if (userId) await logActivity(Number(userId), 'CREATE', `สร้างพื้นที่ ${name}`, 'CleaningArea', area.id)
    res.json(area)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, location, description, isActive, userId } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (location !== undefined) data.location = location
    if (description !== undefined) data.description = description
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true
    if (req.file) data.photo = await uploadToBlob(req.file.buffer, req.file.originalname, 'maid-area-')
    const area = await prisma.cleaningArea.update({ where: { id: Number(req.params.id) }, data })
    if (userId) await logActivity(Number(userId), 'UPDATE', `แก้ไขพื้นที่ ${area.name}`, 'CleaningArea', area.id)
    res.json(area)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const area = await prisma.cleaningArea.findUnique({ where: { id: Number(req.params.id) } })
    if (!area) return res.status(404).json({ error: 'ไม่พบพื้นที่' })
    await prisma.cleaningArea.delete({ where: { id: Number(req.params.id) } })
    if (userId) await logActivity(Number(userId), 'DELETE', `ลบพื้นที่ ${area.name}`, 'CleaningArea', area.id)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
