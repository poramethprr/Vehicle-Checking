const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, phone, role, regCode } = req.body
    if (!username || !phone || !role || !regCode) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    // ตรวจสอบรหัสสมัครสมาชิกจาก ENV
    const validCode = role === 'ADMIN' ? process.env.REG_CODE_ADMIN : process.env.REG_CODE_STAFF
    if (regCode !== validCode) {
      return res.status(401).json({ error: 'รหัสสมัครสมาชิกไม่ถูกต้องสำหรับบทบาทนี้' })
    }

    const phoneTrimmed = phone.trim()
    const existing = await prisma.user.findUnique({ where: { phone: phoneTrimmed } })
    if (existing) {
      return res.status(400).json({ error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' })
    }

    const user = await prisma.user.create({
      data: { 
        username: username.trim(), 
        phone: phoneTrimmed,
        role: role
      }
    })

    await logActivity(user.id, 'REGISTER', `ผู้ใช้ ${username} สมัครสมาชิกในบทบาท ${role}`, 'User', user.id)
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    let { phone } = req.body
    if (!phone) {
      return res.status(400).json({ error: 'กรุณากรอกเบอร์โทร' })
    }

    phone = phone.trim()
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' })
    }

    // ในระบบจริงควรใช้ JWT สร้าง Token ตรงนี้
    await logActivity(user.id, 'LOGIN', `ผู้ใช้ ${user.username} เข้าสู่ระบบ`, 'User', user.id)
    res.json({ user, token: 'session-' + user.id }) // ส่ง mock token ไปก่อนเพื่อให้ frontend ทำงานต่อได้
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
