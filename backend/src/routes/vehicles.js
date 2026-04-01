const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const ExcelJS = require('exceljs')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// Helper functions
function mapStatus(statusText) {
  if (!statusText) return 'ACTIVE'
  const text = statusText.toLowerCase()
  if (text.includes('พร้อม') || text.includes('active')) return 'ACTIVE'
  if (text.includes('ซ่อม') || text.includes('maintenance')) return 'MAINTENANCE'
  if (text.includes('ปลด') || text.includes('inactive')) return 'INACTIVE'
  return 'ACTIVE'
}

function parseDate(dateValue) {
  if (!dateValue) return null
  if (dateValue instanceof Date) return dateValue
  if (typeof dateValue === 'number') {
    // Excel date serial number
    const excelEpoch = new Date(1900, 0, 1)
    return new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000)
  }
  // Handle formula result objects
  if (typeof dateValue === 'object' && dateValue.result) {
    return parseDate(dateValue.result)
  }
  try {
    const d = new Date(dateValue)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

function getCellValue(cell) {
  const val = cell.value
  if (val === null || val === undefined) return null
  // Handle formula cells
  if (typeof val === 'object' && !Array.isArray(val)) {
    if (val.result !== undefined) return val.result
    if (val instanceof Date) return val
  }
  return val
}

// Fields that can be saved (exclude id, createdAt, updatedAt, inspections)
const VEHICLE_FIELDS = [
  'type', 'licensePlate', 'chassisNumber', 'engineNumber',
  'currentMileage', 'nextMileage', 'overMileage', 'status', 'note',
  'prbDate', 'prbLmg', 'prbViriya', 'prbAkney', 'prbThewet', 'prbInsurance', 'prbBangkokInsurance', 'prbTaxDate', 'prbThirdParty', 'prbExpiry',
  'insLmg', 'insViriya', 'insThaiInsurance', 'insInsurance', 'insAkney', 'insThewet', 'insBangkokInsurance', 'insDate', 'insTaxDate', 'insExpiry',
  'taxRenewalDate'
]

function pickVehicleData(body) {
  const data = {}
  for (const key of VEHICLE_FIELDS) {
    if (body[key] !== undefined) {
      // Convert date strings to Date objects
      if (key.endsWith('Date') || key.endsWith('Expiry')) {
        data[key] = body[key] ? new Date(body[key]) : null
      }
      // Convert number fields
      else if (['currentMileage', 'nextMileage', 'overMileage'].includes(key)) {
        data[key] = body[key] !== null && body[key] !== '' ? Number(body[key]) : null
      }
      else {
        data[key] = body[key]
      }
    }
  }
  return data
}

// ─── IMPORTANT: /export and /import must come BEFORE /:id ───────────────────

// Export vehicles to Excel — matches template เวิร์กบุ๊ก1(1).xlsx
router.get('/export', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { licensePlate: 'asc' } })

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Vehicles')

    // ─── Column widths (26 columns) ───
    const colWidths = [5, 22, 22, 18, 16, 14, 14, 12, 14, 20, 14, 8, 8, 8, 8, 14, 18, 14, 8, 8, 12, 14, 8, 8, 18, 14]
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })

    const HEADER_FILL_BLUE  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
    const HEADER_FILL_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    const BORDER_THIN = (style = 'thin') => ({ top: { style }, left: { style }, bottom: { style }, right: { style } })

    // ─── Row 1: Group headers ───
    // Cols 1-11 will be merged vertically (rows 1-2)
    // Col 12-18 = พรบ. (merged horizontally in row 1)
    // Col 19-26 = รอบต่อประกัน (merged horizontally in row 1)
    ws.getRow(1).height = 30

    // Fill row 1 values (before merging)
    const groupHeaders = [
      [1,'NO.'], [2,'ยี่ห้อ/ประเภทรถ'], [3,'เลขตัวถัง'], [4,'เลขเครื่องยนต์'], [5,'ทะเบียน'],
      [6,'ไมล์ครั้งต่อไป'], [7,'ไมล์ปัจจุบัน'], [8,'ระยะที่เกิน'], [9,'สถานะรถ'],
      [10,'หมายเหตุ'], [11,'รอบต่อภาษี'], [12,'พรบ.'], [19,'รอบต่อประกัน']
    ]
    groupHeaders.forEach(([c, v]) => {
      ws.getCell(1, c).value = v
      ws.getCell(1, c).font = { bold: true, name: 'TH Sarabun New', size: 13 }
      ws.getCell(1, c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      ws.getCell(1, c).fill = HEADER_FILL_BLUE
    })

    // ─── Row 2: Sub-headers ───
    ws.getRow(2).height = 28
    const subHeaders = [
      [1,'NO.'], [2,'ยี่ห้อ/ประเภทรถ'], [3,'เลขตัวถัง'], [4,'เลขเครื่องยนต์'], [5,'ทะเบียน'],
      [6,'ไมล์ครั้งต่อไป'], [7,'ไมล์ปัจจุบัน'], [8,'ระยะที่เกิน'], [9,'สถานะรถ'],
      [10,'หมายเหตุ'], [11,'รอบต่อภาษี'],
      [12,'LMG'], [13,'วิริยะ'], [14,'อาคเนย์'], [15,'เทเวศ'],
      [16,'ประกันคุ้มภัย'], [17,'กรุงเทพประกันภัย'], [18,'วันหมดอายุ'],
      [19,'วิริยะ'], [20,'LMG'], [21,'ไทยประกัน'], [22,'ประกันคุ้มภัย'],
      [23,'อาคเนย์'], [24,'เทเวศ'], [25,'กรุงเทพประกันภัย'], [26,'วันหมดอายุ']
    ]
    subHeaders.forEach(([c, v]) => {
      ws.getCell(2, c).value = v
      ws.getCell(2, c).font = { bold: true, name: 'TH Sarabun New', size: 12 }
      ws.getCell(2, c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      ws.getCell(2, c).fill = HEADER_FILL_GREEN
    })

    // ─── Merge cells ───
    // Cols 1-11: merge rows 1-2 vertically
    for (let c = 1; c <= 11; c++) ws.mergeCells(1, c, 2, c)
    // พรบ.: merge cols 12-18 in row 1
    ws.mergeCells(1, 12, 1, 18)
    // รอบต่อประกัน: merge cols 19-26 in row 1
    ws.mergeCells(1, 19, 1, 26)

    // Border header rows
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 26; c++) {
        ws.getCell(r, c).border = BORDER_THIN()
      }
    }

    // ─── Data rows ───
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('th-TH') : ''

    vehicles.forEach((v, idx) => {
      const rowNum = idx + 3
      const rowData = [
        idx + 1,
        v.type || '',
        v.chassisNumber || '',
        v.engineNumber || '',
        v.licensePlate || '',
        v.nextMileage ?? '',
        v.currentMileage ?? '',
        (v.nextMileage != null && v.currentMileage != null) ? v.nextMileage - v.currentMileage : '',
        v.status === 'ACTIVE' ? 'พร้อมใช้งาน' : v.status === 'IN_USE' ? 'กำลังใช้งาน' : v.status === 'MAINTENANCE' ? 'ซ่อมบำรุง' : 'ปลดระวาง',
        v.note || '',
        fmtDate(v.taxRenewalDate),
        v.prbLmg ? '✓' : '',
        v.prbViriya ? '✓' : '',
        v.prbAkney ? '✓' : '',
        v.prbThewet ? '✓' : '',
        v.prbInsurance ? '✓' : '',
        v.prbBangkokInsurance ? '✓' : '',
        fmtDate(v.prbExpiry),
        v.insViriya ? '✓' : '',
        v.insLmg ? '✓' : '',
        v.insThaiInsurance ? '✓' : '',
        v.insInsurance ? '✓' : '',
        v.insAkney ? '✓' : '',
        v.insThewet ? '✓' : '',
        v.insBangkokInsurance ? '✓' : '',
        fmtDate(v.insExpiry),
      ]

      rowData.forEach((val, ci) => {
        const cell = ws.getCell(rowNum, ci + 1)
        cell.value = val
        cell.font = { name: 'TH Sarabun New', size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: ci < 2 ? 'center' : (typeof val === 'number' ? 'right' : (val === '✓' ? 'center' : 'left')), wrapText: true }
        cell.border = BORDER_THIN()
      })

      ws.getRow(rowNum).height = 20
    })

    const filename = `vehicles_${new Date().toISOString().slice(0, 10)}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)

    await workbook.xlsx.write(res)
    res.end()

  } catch (err) {
    console.error('Export error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Import vehicles from Excel
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'กรุณาเลือกไฟล์ Excel' })

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(req.file.path)

    const worksheet = workbook.getWorksheet(1)
    if (!worksheet) return res.status(400).json({ error: 'ไม่พบข้อมูลในไฟล์ Excel' })

    let imported = 0
    let skipped = 0

    // Template has 2 header rows — data starts at row 3
    for (let rowIndex = 3; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex)

      // Skip empty rows (check type and licensePlate columns)
      const typeVal = getCellValue(row.getCell(2))
      const plateVal = getCellValue(row.getCell(5))
      if (!typeVal || !plateVal) { skipped++; continue }

      // Handle type with possible newlines (e.g. "ISUZU\nX-Ray")
      const typeStr = typeVal.toString().trim()

      // Col 8 may be a shared formula — read result
      const overMileageVal = getCellValue(row.getCell(8))

      const data = {
        type:                typeStr,
        chassisNumber:       getCellValue(row.getCell(3))?.toString().trim() || null,
        engineNumber:        getCellValue(row.getCell(4))?.toString().trim() || null,
        licensePlate:        plateVal.toString().trim(),
        nextMileage:         getCellValue(row.getCell(6)) != null ? Number(getCellValue(row.getCell(6))) : null,
        currentMileage:      getCellValue(row.getCell(7)) != null ? Number(getCellValue(row.getCell(7))) : null,
        overMileage:         overMileageVal != null ? Number(overMileageVal) : null,
        status:              mapStatus(getCellValue(row.getCell(9))?.toString()),
        note:                getCellValue(row.getCell(10))?.toString().trim() || null,
        taxRenewalDate:      parseDate(getCellValue(row.getCell(11))),
        // พ.ร.บ. (cols 12-18)
        prbLmg:              getCellValue(row.getCell(12))?.toString().trim() === 'P',
        prbViriya:           getCellValue(row.getCell(13))?.toString().trim() === 'P',
        prbAkney:            getCellValue(row.getCell(14))?.toString().trim() === 'P',
        prbThewet:           getCellValue(row.getCell(15))?.toString().trim() === 'P',
        prbInsurance:        getCellValue(row.getCell(16))?.toString().trim() === 'P',
        prbBangkokInsurance: getCellValue(row.getCell(17))?.toString().trim() === 'P',
        prbExpiry:           parseDate(getCellValue(row.getCell(18))),
        // รอบต่อประกัน: col19=วิริยะ, col20=LMG (matches template row 2 sub-headers)
        insViriya:           getCellValue(row.getCell(19))?.toString().trim() === 'P',
        insLmg:              getCellValue(row.getCell(20))?.toString().trim() === 'P',
        insThaiInsurance:    getCellValue(row.getCell(21))?.toString().trim() === 'P',
        insInsurance:        getCellValue(row.getCell(22))?.toString().trim() === 'P',
        insAkney:            getCellValue(row.getCell(23))?.toString().trim() === 'P',
        insThewet:           getCellValue(row.getCell(24))?.toString().trim() === 'P',
        insBangkokInsurance: getCellValue(row.getCell(25))?.toString().trim() === 'P',
        insExpiry:           parseDate(getCellValue(row.getCell(26))),
      }

      if (!data.type || !data.licensePlate) { skipped++; continue }

      try {
        const existing = await prisma.vehicle.findUnique({ where: { licensePlate: data.licensePlate } })
        if (existing) {
          await prisma.vehicle.update({ where: { id: existing.id }, data: pickVehicleData(data) })
        } else {
          await prisma.vehicle.create({ data: pickVehicleData(data) })
        }
        imported++
      } catch (error) {
        console.error('Error importing vehicle:', data.licensePlate, error.message)
        skipped++
      }
    }

    // Clean up uploaded file
    const fs = require('fs')
    try { fs.unlinkSync(req.file.path) } catch {}

    if (req.body.userId) {
      await logActivity(req.body.userId, 'IMPORT_VEHICLES', `นำเข้ายานพาหนะ ${imported} รายการ`, 'Vehicle', null)
    }

    res.json({ imported, skipped, message: `นำเข้าข้อมูลสำเร็จ ${imported} รายการ${skipped > 0 ? `, ข้าม ${skipped} รายการ` : ''}` })

  } catch (err) {
    console.error('Import error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Routes with :id param must come AFTER static routes ────────────────────

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const { search, status, type } = req.query
    const where = {}

    if (status) where.status = status
    if (type) where.type = type

    if (search) {
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { chassisNumber: { contains: search, mode: 'insensitive' } },
        { engineNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get vehicle by id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(req.params.id) } })
    if (!vehicle) return res.status(404).json({ error: 'ไม่พบยานพาหนะ' })
    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create vehicle
router.post('/', async (req, res) => {
  try {
    const data = pickVehicleData(req.body)
    if (!data.type || !data.licensePlate) {
      return res.status(400).json({ error: 'กรุณากรอกประเภทรถและทะเบียน' })
    }

    const vehicle = await prisma.vehicle.create({ data })

    if (req.body.userId) {
      await logActivity(req.body.userId, 'CREATE_VEHICLE', `เพิ่มยานพาหนะ ${data.type} ทะเบียน ${data.licensePlate}`, 'Vehicle', vehicle.id)
    }

    res.json(vehicle)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'ทะเบียนนี้มีอยู่ในระบบแล้ว' })
    res.status(500).json({ error: err.message })
  }
})

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const data = pickVehicleData(req.body)
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(req.params.id) },
      data
    })

    if (req.body.userId) {
      await logActivity(req.body.userId, 'UPDATE_VEHICLE', `แก้ไขยานพาหนะ ${vehicle.type} ทะเบียน ${vehicle.licensePlate}`, 'Vehicle', vehicle.id)
    }

    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(req.params.id) } })

    await prisma.vehicle.delete({ where: { id: Number(req.params.id) } })

    if (userId && vehicle) {
      await logActivity(userId, 'DELETE_VEHICLE', `ลบยานพาหนะ ${vehicle.type} ทะเบียน ${vehicle.licensePlate}`, 'Vehicle', vehicle.id)
    }

    res.json({ message: 'ลบยานพาหนะสำเร็จ' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
