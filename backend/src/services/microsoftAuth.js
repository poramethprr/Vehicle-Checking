const https = require('https')
const crypto = require('crypto')

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3007'

// In-memory CSRF state store — key = state string, value = expiry timestamp
const stateStore = new Map()

// Clean up expired states every 15 minutes
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of stateStore) {
    if (now > v) stateStore.delete(k)
  }
}, 15 * 60 * 1000)

function generateAuthUrl() {
  const state = crypto.randomBytes(16).toString('hex')
  stateStore.set(state, Date.now() + 10 * 60 * 1000) // 10-minute expiry

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    response_mode: 'query',
    scope: 'openid email profile User.Read',
    state,
  })
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`
}

function validateState(state) {
  const expiry = stateStore.get(state)
  if (!expiry) return false
  stateStore.delete(state)
  return Date.now() < expiry
}

function httpsPost(url, formData) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(formData).toString()
    const u = new URL(url)
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve(JSON.parse(raw)) } catch { reject(new Error('Invalid JSON from token endpoint')) }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve(JSON.parse(raw)) } catch { reject(new Error('Invalid JSON from Graph API')) }
        })
      }
    )
    req.on('error', reject)
    req.end()
  })
}

async function exchangeCodeForToken(code) {
  return httpsPost('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    code,
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    grant_type: 'authorization_code',
  })
}

async function getMicrosoftUser(accessToken) {
  const profile = await httpsGet('https://graph.microsoft.com/v1.0/me', {
    Authorization: `Bearer ${accessToken}`,
  })
  return {
    microsoftId: profile.id,
    email: profile.mail || profile.userPrincipalName,
    name: profile.displayName,
  }
}

module.exports = { generateAuthUrl, validateState, exchangeCodeForToken, getMicrosoftUser, FRONTEND_URL }
