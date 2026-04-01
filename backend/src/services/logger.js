const prisma = require('./prisma')

async function logActivity(userId, action, detail, entityType = null, entityId = null) {
  return prisma.activityLog.create({
    data: { userId, action, detail, entityType, entityId }
  })
}

module.exports = { logActivity }
