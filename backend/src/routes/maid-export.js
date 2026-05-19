const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const ExcelJS = require('exceljs')

function dateWhere(startDate, endDate) {
  if (!startDate && !endDate) return undefined
  const w = {}
  if (startDate) w.gte = new Date(startDate)
  if (endDate) w.lte = new Date(endDate + 'T23:59:59')
  return w
}

function headerStyle(ws) {
  ws.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })
}

router.get('/logs', async (req, res) => {
  try {
    const { startDate, endDate, areaId } = req.query
    const where = {}
    if (areaId) where.areaId = Number(areaId)
    const cw = dateWhere(startDate, endDate)
    if (cw) where.createdAt = cw

    const logs = await prisma.cleaningLog.findMany({
      where,
      include: {
        area: true,
        user: { select: { id: true, username: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('บันทึกการทำความสะอาด')
    ws.columns = [
      { header: 'ลำดับ', key: 'no', width: 8 },
      { header: 'วันที่/เวลา', key: 'date', width: 22 },
      { header: 'พื้นที่', key: 'area', width: 22 },
      { header: 'สถานที่', key: 'location', width: 22 },
      { header: 'ผู้บันทึก', key: 'user', width: 20 },
      { header: 'หมายเหตุ', key: 'note', width: 30 },
    ]
    headerStyle(ws)
    logs.forEach((l, i) => {
      ws.addRow({
        no: i + 1,
        date: new Date(l.createdAt).toLocaleString('th-TH'),
        area: l.area.name,
        location: l.area.location || '',
        user: l.user.displayName || l.user.username,
        note: l.note || ''
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="cleaning-logs.xlsx"')
    await wb.xlsx.write(res)
    res.end()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/issues', async (req, res) => {
  try {
    const { startDate, endDate, areaId, status } = req.query
    const where = {}
    if (areaId) where.areaId = Number(areaId)
    if (status) where.status = status
    const cw = dateWhere(startDate, endDate)
    if (cw) where.createdAt = cw

    const issues = await prisma.cleaningIssue.findMany({
      where,
      include: {
        area: true,
        user: { select: { id: true, username: true, displayName: true } },
        resolver: { select: { id: true, username: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('รายงานปัญหา')
    ws.columns = [
      { header: 'ลำดับ', key: 'no', width: 8 },
      { header: 'วันที่แจ้ง', key: 'date', width: 22 },
      { header: 'พื้นที่', key: 'area', width: 22 },
      { header: 'หัวข้อ', key: 'title', width: 28 },
      { header: 'รายละเอียด', key: 'desc', width: 32 },
      { header: 'ผู้แจ้ง', key: 'user', width: 20 },
      { header: 'สถานะ', key: 'status', width: 18 },
      { header: 'ผู้แก้ไข', key: 'resolver', width: 20 },
      { header: 'หมายเหตุผู้แก้ไข', key: 'resolverNote', width: 28 },
    ]
    headerStyle(ws)
    const statusLabel = { OPEN: 'รอดำเนินการ', IN_PROGRESS: 'กำลังดำเนินการ', RESOLVED: 'แก้ไขแล้ว' }
    issues.forEach((issue, i) => {
      ws.addRow({
        no: i + 1,
        date: new Date(issue.createdAt).toLocaleString('th-TH'),
        area: issue.area.name,
        title: issue.title,
        desc: issue.description || '',
        user: issue.user.displayName || issue.user.username,
        status: statusLabel[issue.status] || issue.status,
        resolver: issue.resolver ? (issue.resolver.displayName || issue.resolver.username) : '',
        resolverNote: issue.resolverNote || ''
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="cleaning-issues.xlsx"')
    await wb.xlsx.write(res)
    res.end()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const cw = dateWhere(startDate, endDate)
    const areas = await prisma.cleaningArea.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('สรุปการทำความสะอาด')
    ws.columns = [
      { header: 'พื้นที่', key: 'area', width: 24 },
      { header: 'สถานที่', key: 'location', width: 22 },
      { header: 'ครั้งที่ทำความสะอาด', key: 'logs', width: 22 },
      { header: 'ปัญหาทั้งหมด', key: 'issues', width: 18 },
      { header: 'ปัญหาที่แก้ไขแล้ว', key: 'resolved', width: 20 },
      { header: 'ปัญหารอดำเนินการ', key: 'open', width: 20 },
    ]
    headerStyle(ws)

    for (const area of areas) {
      const logWhere = { areaId: area.id }
      const issueWhere = { areaId: area.id }
      if (cw) { logWhere.createdAt = cw; issueWhere.createdAt = cw }

      const [logCount, issueCount, resolvedCount] = await Promise.all([
        prisma.cleaningLog.count({ where: logWhere }),
        prisma.cleaningIssue.count({ where: issueWhere }),
        prisma.cleaningIssue.count({ where: { ...issueWhere, status: 'RESOLVED' } }),
      ])
      ws.addRow({
        area: area.name,
        location: area.location || '',
        logs: logCount,
        issues: issueCount,
        resolved: resolvedCount,
        open: issueCount - resolvedCount
      })
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="cleaning-summary.xlsx"')
    await wb.xlsx.write(res)
    res.end()
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
