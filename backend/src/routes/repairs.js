const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { uploadWithPdf } = require('../middleware/upload')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

const INCLUDE = {
  vehicle: { select: { id: true, type: true, licensePlate: true } },
  user: { select: { id: true, username: true, displayName: true } },
  approvedBy: { select: { id: true, username: true, displayName: true } }
}

// GET / — list (admin: all, staff: own)
router.get('/', async (req, res) => {
  try {
    const { userId, status, vehicleId, startDate, endDate, page = 1, limit = 100 } = req.query
    const where = {}
    if (userId) where.userId = Number(userId)
    if (status) where.status = status
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

    const [requests, total] = await Promise.all([
      prisma.repairRequest.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.repairRequest.count({ where })
    ])
    res.json({ requests, total })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST / — create repair request
router.post('/', uploadWithPdf.single('document'), async (req, res) => {
  try {
    const { vehicleId, userId, title, detail, estimatedCost } = req.body
    if (!vehicleId || !userId || !title || !detail) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const repair = await prisma.repairRequest.create({
      data: {
        vehicleId: Number(vehicleId),
        userId: Number(userId),
        title: title.trim(),
        detail: detail.trim(),
        estimatedCost: estimatedCost ? Number(estimatedCost) : null,
        documentPath: req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'repair-') : null,
        status: 'PENDING'
      },
      include: INCLUDE
    })

    await logActivity(userId, 'REPAIR_REQUEST', `แจ้งซ่อม "${title}" - ${repair.vehicle.licensePlate}`, 'RepairRequest', repair.id)
    res.json(repair)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id/approve — admin approves + set vehicle to MAINTENANCE
router.put('/:id/approve', async (req, res) => {
  try {
    const { adminId, approverNote } = req.body
    const existing = await prisma.repairRequest.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    const [repair] = await prisma.$transaction([
      prisma.repairRequest.update({
        where: { id: Number(req.params.id) },
        data: { status: 'APPROVED', approvedById: Number(adminId), approvedAt: new Date(), approverNote: approverNote || null },
        include: INCLUDE
      }),
      prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'MAINTENANCE' }
      })
    ])
    await logActivity(adminId, 'REPAIR_APPROVE', `อนุมัติซ่อม "${repair.title}" - ${repair.vehicle.licensePlate}`, 'RepairRequest', repair.id)
    res.json(repair)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id/complete — mark repair as done, restore vehicle to ACTIVE
router.put('/:id/complete', async (req, res) => {
  try {
    const { adminId, completedNote } = req.body
    const existing = await prisma.repairRequest.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    const [repair] = await prisma.$transaction([
      prisma.repairRequest.update({
        where: { id: Number(req.params.id) },
        data: { status: 'COMPLETED', completedAt: new Date(), approverNote: completedNote || existing.approverNote },
        include: INCLUDE
      }),
      prisma.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'ACTIVE' }
      })
    ])
    await logActivity(adminId, 'REPAIR_COMPLETE', `ซ่อมเสร็จ "${repair.title}" - ${repair.vehicle.licensePlate}`, 'RepairRequest', repair.id)
    res.json(repair)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /:id/reject — admin rejects
router.put('/:id/reject', async (req, res) => {
  try {
    const { adminId, approverNote } = req.body
    const repair = await prisma.repairRequest.update({
      where: { id: Number(req.params.id) },
      data: {
        status: 'REJECTED',
        approvedById: Number(adminId),
        approvedAt: new Date(),
        approverNote: approverNote || null
      },
      include: INCLUDE
    })
    await logActivity(adminId, 'REPAIR_REJECT', `ไม่อนุมัติซ่อม "${repair.title}" - ${repair.vehicle.licensePlate}`, 'RepairRequest', repair.id)
    res.json(repair)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const { actionUserId } = req.body
    const repair = await prisma.repairRequest.findUnique({ where: { id: Number(req.params.id) }, include: { vehicle: { select: { licensePlate: true } } } })
    if (!repair) return res.status(404).json({ error: 'ไม่พบข้อมูล' })

    if (repair.documentPath) deleteFromBlob(repair.documentPath).catch(() => {})

    await prisma.repairRequest.delete({ where: { id: Number(req.params.id) } })
    if (actionUserId) {
      await logActivity(actionUserId, 'DELETE', `ลบใบแจ้งซ่อม "${repair.title}" - ${repair.vehicle.licensePlate}`, 'RepairRequest', repair.id)
    }
    res.json({ message: 'ลบสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
