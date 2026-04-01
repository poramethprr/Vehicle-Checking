const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')

// Create user (Admin only)
router.post('/', async (req, res) => {
  try {
    const { username, phone, role, actionUserId } = req.body
    if (!username || !phone || !role) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const phoneTrimmed = phone.trim()
    const existing = await prisma.user.findUnique({ where: { phone: phoneTrimmed } })
    if (existing) {
      return res.status(400).json({ error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' })
    }

    const user = await prisma.user.create({
      data: { username: username.trim(), phone: phoneTrimmed, role }
    })

    if (actionUserId) {
      await logActivity(actionUserId, 'CREATE_USER', `เพิ่มผู้ใช้ ${username} บทบาท ${role}`, 'User', user.id)
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, phone, role, actionUserId } = req.body
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { username, phone, role }
    })

    if (actionUserId) {
      await logActivity(actionUserId, 'UPDATE_USER', `แก้ไขผู้ใช้ ${username}`, 'User', user.id)
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { actionUserId } = req.body
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })

    await prisma.user.delete({ where: { id: Number(req.params.id) } })

    if (actionUserId && user) {
      await logActivity(actionUserId, 'DELETE_USER', `ลบผู้ใช้ ${user.username}`, 'User', user.id)
    }

    res.json({ message: 'ลบผู้ใช้สำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
