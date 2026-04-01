const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const INSPECTION_ITEMS = require('../services/inspectionItems')

// Get all inspections (with filters)
router.get('/', async (req, res) => {
  try {
    const { vehicleId, month, year } = req.query
    const where = {}

    if (vehicleId) where.vehicleId = Number(vehicleId)

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
      where.inspectionDate = { gte: startDate, lte: endDate }
    }

    const inspections = await prisma.inspection.findMany({
      where,
      include: {
        vehicle: true,
        user: { select: { id: true, username: true, phone: true } },
        details: { orderBy: { itemNumber: 'asc' } }
      },
      orderBy: { inspectionDate: 'desc' }
    })

    res.json(inspections)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single inspection
router.get('/:id', async (req, res) => {
  try {
    const inspection = await prisma.inspection.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        vehicle: true,
        user: { select: { id: true, username: true, phone: true } },
        details: { orderBy: { itemNumber: 'asc' } }
      }
    })
    if (!inspection) return res.status(404).json({ error: 'ไม่พบข้อมูลการตรวจ' })
    res.json(inspection)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get inspection items template
router.get('/items/template', async (req, res) => {
  res.json(INSPECTION_ITEMS)
})

// Create inspection
router.post('/', async (req, res) => {
  try {
    const { vehicleId, userId, inspectionDate, details } = req.body

    if (!vehicleId || !userId || !inspectionDate || !details) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' })
    }

    const inspection = await prisma.inspection.create({
      data: {
        vehicleId: Number(vehicleId),
        userId: Number(userId),
        inspectionDate: new Date(inspectionDate),
        details: {
          create: details.map(d => ({
            itemNumber: d.itemNumber,
            itemName: d.itemName,
            status: d.status,
            abnormalNote: d.abnormalNote || null
          }))
        }
      },
      include: {
        vehicle: true,
        user: { select: { id: true, username: true } },
        details: true
      }
    })

    await logActivity(
      Number(userId),
      'CREATE_INSPECTION',
      `บันทึกการตรวจเช็คยานพาหนะ ทะเบียน ${inspection.vehicle.licensePlate} วันที่ ${inspectionDate}`,
      'Inspection',
      inspection.id
    )

    res.json(inspection)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'มีการตรวจเช็ครถคันนี้ในวันที่นี้แล้ว' })
    }
    res.status(500).json({ error: err.message })
  }
})

// Update inspection
router.put('/:id', async (req, res) => {
  try {
    const { userId, details } = req.body
    const inspectionId = Number(req.params.id)

    // Delete old details and create new ones
    await prisma.inspectionDetail.deleteMany({ where: { inspectionId } })

    const inspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        details: {
          create: details.map(d => ({
            itemNumber: d.itemNumber,
            itemName: d.itemName,
            status: d.status,
            abnormalNote: d.abnormalNote || null
          }))
        }
      },
      include: {
        vehicle: true,
        user: { select: { id: true, username: true } },
        details: { orderBy: { itemNumber: 'asc' } }
      }
    })

    if (userId) {
      await logActivity(
        Number(userId),
        'UPDATE_INSPECTION',
        `แก้ไขการตรวจเช็คยานพาหนะ ทะเบียน ${inspection.vehicle.licensePlate}`,
        'Inspection',
        inspection.id
      )
    }

    res.json(inspection)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete inspection
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const inspection = await prisma.inspection.findUnique({
      where: { id: Number(req.params.id) },
      include: { vehicle: true }
    })

    await prisma.inspection.delete({ where: { id: Number(req.params.id) } })

    if (userId && inspection) {
      await logActivity(
        Number(userId),
        'DELETE_INSPECTION',
        `ลบการตรวจเช็คยานพาหนะ ทะเบียน ${inspection.vehicle.licensePlate}`,
        'Inspection',
        inspection.id
      )
    }

    res.json({ message: 'ลบข้อมูลการตรวจสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
