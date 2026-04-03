const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password, role, regCode } = req.body
    if (!username || !phone || !password || !role || !regCode) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const validCode = role === 'ADMIN' ? process.env.REG_CODE_ADMIN : process.env.REG_CODE_STAFF
    if (regCode !== validCode) {
      return res.status(401).json({ error: 'รหัสสมัครสมาชิกไม่ถูกต้องสำหรับบทบาทนี้' })
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: username.trim() } })
    if (existingUsername) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' })
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } })
    if (existingPhone) {
      return res.status(400).json({ error: 'เบอร์โทรนี้ถูกใช้งานแล้ว' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role
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
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    }

    const user = await prisma.user.findUnique({ where: { username: username.trim() } })
    if (!user) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }

    if (!user.password) {
      return res.status(401).json({ error: 'บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    }

    await logActivity(user.id, 'LOGIN', `ผู้ใช้ ${user.username} เข้าสู่ระบบ`, 'User', user.id)
    res.json({ user, token: 'session-' + user.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
