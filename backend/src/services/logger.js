const prisma = require('./prisma')

async function logActivity(userId, action, detail, entityType = null, entityId = null) {
  return prisma.activityLog.create({
    data: { userId: Number(userId), action, detail, entityType, entityId: entityId ? Number(entityId) : null }
  })
}

module.exports = { logActivity }
