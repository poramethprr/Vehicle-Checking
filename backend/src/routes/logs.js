const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')

// Get all logs with filters
router.get('/', async (req, res) => {
  try {
    const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query
    const where = {}

    if (userId) where.userId = Number(userId)
    if (action) where.action = action

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: { user: { select: { id: true, username: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.activityLog.count({ where })
    ])

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
