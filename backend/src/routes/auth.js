const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const { generateAuthUrl, validateState, exchangeCodeForToken, getMicrosoftUser } = require('../services/microsoftAuth')

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, displayName, phone, password, role, regCode } = req.body
    if (!username || !phone || !password || !role || !regCode) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    const validCode = role === 'ADMIN' ? process.env.REG_CODE_ADMIN
      : role === 'MANAGER' ? process.env.REG_CODE_MANAGER
      : role === 'MAID' ? process.env.REG_CODE_MAID
      : process.env.REG_CODE_STAFF
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
        displayName: displayName ? displayName.trim() : null,
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

    if (user.requireMicrosoftSSO) {
      return res.status(401).json({ error: 'บัญชีนี้ต้องเข้าสู่ระบบผ่าน Microsoft เท่านั้น กรุณาใช้ปุ่ม "เข้าสู่ระบบด้วย Microsoft"' })
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

// Get current user by session token
router.get('/me', async (req, res) => {
  try {
    const token = req.query.token || (req.headers.authorization || '').replace('Bearer ', '')
    if (!token || !token.startsWith('session-')) {
      return res.status(401).json({ error: 'Token ไม่ถูกต้อง' })
    }
    const userId = parseInt(token.replace('session-', ''), 10)
    if (isNaN(userId)) return res.status(401).json({ error: 'Token ไม่ถูกต้อง' })
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' })
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Microsoft SSO — redirect to Microsoft login
router.get('/microsoft', (req, res) => {
  try {
    const url = generateAuthUrl()
    console.log('[MS SSO] Redirecting to:', url)
    res.redirect(url)
  } catch (err) {
    console.error('[MS SSO] generateAuthUrl error:', err)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007'
    res.redirect(`${frontendUrl}/login?error=microsoft_failed`)
  }
})

// Microsoft SSO — callback after Microsoft login
router.get('/microsoft/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3007'
  try {
    const { code, state, error } = req.query

    if (error === 'access_denied') {
      return res.redirect(`${frontendUrl}/login?error=microsoft_cancelled`)
    }
    if (!validateState(state)) {
      return res.redirect(`${frontendUrl}/login?error=invalid_state`)
    }

    const tokenRes = await exchangeCodeForToken(code)
    if (tokenRes.error || !tokenRes.access_token) {
      console.error('[MS SSO] Token exchange failed:', JSON.stringify(tokenRes))
      return res.redirect(`${frontendUrl}/login?error=microsoft_failed`)
    }

    const msUser = await getMicrosoftUser(tokenRes.access_token)

    // 1. Find by microsoftId
    let user = await prisma.user.findUnique({ where: { microsoftId: msUser.microsoftId } })

    // 2. Find by microsoftEmail
    if (!user && msUser.email) {
      user = await prisma.user.findFirst({ where: { microsoftEmail: msUser.email } })
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { microsoftId: msUser.microsoftId },
        })
      }
    }

    // 3. No account found
    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=account_not_found`)
    }

    await logActivity(user.id, 'LOGIN_MICROSOFT', `ผู้ใช้ ${user.username} เข้าสู่ระบบด้วย Microsoft`, 'User', user.id)

    const token = 'session-' + user.id
    res.redirect(`${frontendUrl}/microsoft-callback?token=${token}`)
  } catch (err) {
    console.error('Microsoft callback error:', err)
    res.redirect(`${frontendUrl}/login?error=microsoft_failed`)
  }
})

module.exports = router
