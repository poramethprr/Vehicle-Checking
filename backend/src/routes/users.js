const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { upload } = require('../middleware/upload')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

function parseDateInput(value) {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim())
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return null
}

// Create user (Admin only)
router.post('/', upload.single('licensePhoto'), async (req, res) => {
  try {
    const { username, displayName, phone, role, actionUserId, licenseNumber, licenseExpiry } = req.body
    if (!username || !phone || !role) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const phoneTrimmed = phone.trim()
    const existing = await prisma.user.findUnique({ where: { phone: phoneTrimmed } })
    if (existing) {
      return res.status(400).json({ error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' })
    }

    const data = {
      username: username.trim(),
      displayName: displayName ? displayName.trim() : null,
      phone: phoneTrimmed,
      role,
      licenseNumber: licenseNumber ? licenseNumber.trim() : null,
      licenseExpiry: parseDateInput(licenseExpiry),
      licensePhoto: req.file ? await uploadToBlob(req.file.buffer, req.file.originalname, 'license-') : null
    }
    if (req.body.password) {
      data.password = await bcrypt.hash(req.body.password, 10)
    }
    const user = await prisma.user.create({ data })

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
router.put('/:id', upload.single('licensePhoto'), async (req, res) => {
  try {
    const { username, displayName, phone, role, password, actionUserId, licenseNumber, licenseExpiry, removeLicensePhoto, microsoftEmail, requireMicrosoftSSO } = req.body

    const existing = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'ไม่พบผู้ใช้' })

    const data = {
      username,
      displayName: displayName !== undefined ? displayName : undefined,
      phone,
      role,
      licenseNumber: licenseNumber ? licenseNumber.trim() : null,
      licenseExpiry: parseDateInput(licenseExpiry)
    }

    if (req.file) {
      if (existing.licensePhoto) deleteFromBlob(existing.licensePhoto).catch(() => {})
      data.licensePhoto = await uploadToBlob(req.file.buffer, req.file.originalname, 'license-')
    } else if (removeLicensePhoto === 'true') {
      if (existing.licensePhoto) deleteFromBlob(existing.licensePhoto).catch(() => {})
      data.licensePhoto = null
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    if (microsoftEmail !== undefined) {
      data.microsoftEmail = microsoftEmail || null
    }
    if (requireMicrosoftSSO !== undefined) {
      data.requireMicrosoftSSO = requireMicrosoftSSO === 'true' || requireMicrosoftSSO === true
      // If enabling SSO-only, clear password
      if (data.requireMicrosoftSSO) {
        data.password = null
      }
    }

    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data })

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

    if (user?.licensePhoto) deleteFromBlob(user.licensePhoto).catch(() => {})

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
