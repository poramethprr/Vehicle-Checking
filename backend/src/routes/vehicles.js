const express = require('express')
const router = express.Router()
const prisma = require('../services/prisma')
const { logActivity } = require('../services/logger')
const ExcelJS = require('exceljs')
const multer = require('multer')
const path = require('path')
const { uploadToBlob, deleteFromBlob } = require('../services/azureBlob')

const upload = multer({ storage: multer.memoryStorage() })
const photoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })
const docUpload = photoUpload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'prbDoc', maxCount: 1 },
  { name: 'taxDoc', maxCount: 1 },
  { name: 'insDoc', maxCount: 1 },
  { name: 'gasDoc', maxCount: 1 },
])

// Helper functions
function mapStatus(statusText) {
  if (!statusText) return 'ACTIVE'
  const text = statusText.toLowerCase()
  if (text.includes('พร้อม') || text.includes('active')) return 'ACTIVE'
  if (text.includes('ซ่อม') || text.includes('maintenance')) return 'MAINTENANCE'
  if (text.includes('ปลด') || text.includes('inactive')) return 'INACTIVE'
  return 'ACTIVE'
}

// Thai month names → month number (1-12)
const THAI_MONTHS = {
  'ม.ค.': 1, 'มกราคม': 1,
  'ก.พ.': 2, 'กุมภาพันธ์': 2,
  'มี.ค.': 3, 'มีนาคม': 3,
  'เม.ย.': 4, 'เมษายน': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5,
  'มิ.ย.': 6, 'มิถุนายน': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7,
  'ส.ค.': 8, 'สิงหาคม': 8,
  'ก.ย.': 9, 'กันยายน': 9,
  'ต.ค.': 10, 'ตุลาคม': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11,
  'ธ.ค.': 12, 'ธันวาคม': 12
}

// Convert year to Gregorian (ค.ศ.)
// - 2-digit (e.g. 68) → treat as พ.ศ. 2568 → 2568 - 543 = 2025
// - 4-digit ≥ 2500    → treat as พ.ศ. → subtract 543
// - anything else     → already Gregorian
function toGregorianYear(y) {
  if (y >= 2500) return y - 543
  if (y >= 100) return y
  return (2500 + y) - 543  // 2-digit พ.ศ.
}

// สร้าง Date แบบ UTC เพื่อหลีกเลี่ยงปัญหา timezone offset
function makeDate(day, month, year) {
  const y = toGregorianYear(year)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(Date.UTC(y, month - 1, day))
  return isNaN(d.getTime()) ? null : d
}

function parseDate(dateValue) {
  if (!dateValue) return null

  // Already a JS Date — ExcelJS อาจคืนปี พ.ศ. กลับมา (≥ 2500) ให้ลบ 543 ก่อน
  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null
    let y = dateValue.getFullYear()
    if (y >= 2500) y -= 543
    return new Date(Date.UTC(y, dateValue.getMonth(), dateValue.getDate()))
  }

  // Excel date serial number
  // (serial - 25569) * 86400000 แปลง Excel epoch → Unix epoch (UTC)
  if (typeof dateValue === 'number') {
    if (dateValue < 1) return null
    const d = new Date(Math.round((dateValue - 25569) * 86400) * 1000)
    return isNaN(d.getTime()) ? null : d
  }

  // Formula result object  { result: ... }
  if (typeof dateValue === 'object' && dateValue !== null) {
    if (dateValue.result !== undefined) return parseDate(dateValue.result)
    return null
  }

  if (typeof dateValue !== 'string') return null
  const str = dateValue.toString().trim()
  if (!str) return null

  // ── 1. Contains Thai month name (e.g. "6 พ.ย. 68", "6 พ.ย. 2568", "15 มกราคม 2567") ──
  for (const [name, monthNum] of Object.entries(THAI_MONTHS)) {
    if (str.includes(name)) {
      const cleaned = str.replace(name, '|').split('|').map(s => s.trim())
      const day = parseInt(cleaned[0])
      const year = parseInt(cleaned[1])
      if (!isNaN(day) && !isNaN(year)) return makeDate(day, monthNum, year)
    }
  }

  // ── 2. Slash / dash / dot numeric (d/m/y  หรือ  y/m/d) ──
  const sepMatch = str.match(/^(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/)
  if (sepMatch) {
    const [, a, b, c] = sepMatch.map(Number)
    // ถ้าตัวแรกเป็นปี 4 หลัก (≥ 1000) → y/m/d
    if (a >= 1000) return makeDate(c, b, a)
    // ไทยใช้ d/m/y เป็นหลัก
    return makeDate(a, b, c)
  }

  // ── 3. ISO string "YYYY-MM-DD" — ปี ≥ 2500 ถือเป็น พ.ศ. ลบ 543 ก่อน ──
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    let y = +isoMatch[1]
    if (y >= 2500) y -= 543
    const d = new Date(Date.UTC(y, +isoMatch[2] - 1, +isoMatch[3]))
    return isNaN(d.getTime()) ? null : d
  }

  return null
}

function parseLicensePlate(lp) {
  if (!lp) return { prefix: '', number: '', province: '' }
  const parts = lp.trim().split(/\s+/)
  if (parts.length >= 3) return { prefix: parts[0], number: parts[1], province: parts.slice(2).join(' ') }
  if (parts.length === 2) {
    const m = parts[0].match(/^([\u0E00-\u0E7FA-Za-z]+)(\d+)$/)
    if (m) return { prefix: m[1], number: m[2], province: parts[1] }
    return { prefix: parts[0], number: '', province: parts[1] }
  }
  return { prefix: lp, number: '', province: '' }
}

function parseBool(val) {
  if (!val) return false
  const s = val.toString().trim().toLowerCase()
  return s === 'p' || s === '✓' || s === 'true' || s === 'yes' || s === '1'
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

const VEHICLE_FIELDS = [
  'type', 'licensePlate', 'registrationBookNumber', 'chassisNumber', 'engineNumber',
  'currentMileage', 'nextMileage', 'overMileage', 'status', 'note',
  'prbDate', 'prbLmg', 'prbViriya', 'prbAkney', 'prbThewet', 'prbInsurance', 'prbBangkokInsurance', 'prbTaxDate', 'prbThirdParty', 'prbExpiry', 'prbContact',
  'insLmg', 'insViriya', 'insThaiInsurance', 'insInsurance', 'insAkney', 'insThewet', 'insBangkokInsurance', 'insDate', 'insTaxDate', 'insExpiry', 'insContact',
  'taxRenewalDate'
]

const BOOL_FIELDS = [
  'prbLmg', 'prbViriya', 'prbAkney', 'prbThewet', 'prbInsurance', 'prbBangkokInsurance', 'prbThirdParty',
  'insLmg', 'insViriya', 'insThaiInsurance', 'insInsurance', 'insAkney', 'insThewet', 'insBangkokInsurance'
]

function deletePhotoFile(url) {
  deleteFromBlob(url).catch(() => {})
}

// แปลง "YYYY-MM-DD" string จาก datepicker → UTC midnight อย่างถูกต้อง
// new Date("YYYY-MM-DD") ใน JS แปลงเป็น UTC midnight ซึ่งถูกต้องสำหรับ Prisma แล้ว
// แต่ต้องแน่ใจว่าไม่มี timezone shift ผิดพลาด
function parseDateInput(value) {
  if (!value) return null
  // ถ้าเป็น "YYYY-MM-DD" format (จาก datepicker) → แปลงเป็น UTC midnight โดยตรง
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  }
  // รูปแบบอื่น (เช่น ISO string เต็ม) → ใช้ parseDate ที่มีอยู่
  return parseDate(value)
}

function pickVehicleData(body) {
  const data = {}
  for (const key of VEHICLE_FIELDS) {
    if (body[key] !== undefined) {
      if (key.endsWith('Date') || key.endsWith('Expiry')) {
        data[key] = body[key] ? parseDateInput(body[key]) : null
      } else if (['currentMileage', 'nextMileage', 'overMileage'].includes(key)) {
        data[key] = body[key] !== null && body[key] !== '' ? Number(body[key]) : null
      } else if (BOOL_FIELDS.includes(key)) {
        data[key] = body[key] === true || body[key] === 'true'
      } else {
        data[key] = body[key]
      }
    }
  }
  return data
}

// ─── IMPORTANT: /export and /import must come BEFORE /:id ───────────────────

// Export vehicles to Excel
// Column layout (28 cols):
// 1=NO. 2=ประเภท 3=ตัวถัง 4=เครื่อง | 5=ตัวอักษร 6=เลข 7=จังหวัด (ทะเบียน) |
// 8=ไมล์ถัดไป 9=ไมล์ปัจจุบัน 10=ระยะเกิน 11=สถานะ 12=หมายเหตุ 13=ต่อภาษี |
// 14-20=พรบ. | 21-28=รอบต่อประกัน
router.get('/export', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { licensePlate: 'asc' } })

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('Vehicles')

    const colWidths = [5, 22, 18, 16, 12, 12, 22, 14, 14, 12, 14, 20, 14, 8, 8, 8, 8, 14, 18, 14, 8, 8, 12, 14, 8, 8, 18, 14]
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })

    const FILL_BLUE  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }
    const FILL_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    const FILL_AMBER = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
    const BORDER = () => ({ top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } })

    ws.getRow(1).height = 30
    ws.getRow(2).height = 28

    // ─── Row 1: Group headers ───
    // Single-col groups (merge rows 1-2): cols 1-4, 8-13
    // "ทะเบียน" merged across cols 5-7 in row 1
    // "พรบ." merged across cols 14-20 in row 1
    // "รอบต่อประกัน" merged across cols 21-28 in row 1
    const row1 = [
      [1,'NO.'], [2,'ยี่ห้อ/ประเภทรถ'], [3,'เลขตัวถัง'], [4,'เลขเครื่องยนต์'],
      [5,'ทะเบียนรถ'],
      [8,'ไมล์ครั้งต่อไป'], [9,'ไมล์ปัจจุบัน'], [10,'ระยะที่เกิน'],
      [11,'สถานะรถ'], [12,'หมายเหตุ'], [13,'รอบต่อภาษี'],
      [14,'พรบ.'], [21,'รอบต่อประกัน']
    ]
    row1.forEach(([c, v]) => {
      const cell = ws.getCell(1, c)
      cell.value = v
      cell.font = { bold: true, name: 'TH Sarabun New', size: 13 }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.fill = FILL_BLUE
    })

    // ─── Row 2: Sub-headers ───
    const row2 = [
      [1,'NO.'], [2,'ยี่ห้อ/ประเภทรถ'], [3,'เลขตัวถัง'], [4,'เลขเครื่องยนต์'],
      [5,'ตัวอักษรนำหน้า'], [6,'หมายเลข'], [7,'จังหวัด'],
      [8,'ไมล์ครั้งต่อไป'], [9,'ไมล์ปัจจุบัน'], [10,'ระยะที่เกิน'],
      [11,'สถานะรถ'], [12,'หมายเหตุ'], [13,'รอบต่อภาษี'],
      [14,'LMG'], [15,'วิริยะ'], [16,'อาคเนย์'], [17,'เทเวศ'],
      [18,'ประกันคุ้มภัย'], [19,'กรุงเทพประกันภัย'], [20,'วันหมดอายุ พรบ.'],
      [21,'วิริยะ'], [22,'LMG'], [23,'ไทยประกัน'], [24,'ประกันคุ้มภัย'],
      [25,'อาคเนย์'], [26,'เทเวศ'], [27,'กรุงเทพประกันภัย'], [28,'วันหมดอายุ']
    ]
    row2.forEach(([c, v]) => {
      const cell = ws.getCell(2, c)
      cell.value = v
      cell.font = { bold: true, name: 'TH Sarabun New', size: 12 }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.fill = FILL_GREEN
    })

    // ─── Merge cells ───
    // Single cols: merge rows 1-2
    const singleMergeCols = [1, 2, 3, 4, 8, 9, 10, 11, 12, 13]
    singleMergeCols.forEach(c => ws.mergeCells(1, c, 2, c))
    // ทะเบียน: cols 5-7 row 1; color amber
    ws.mergeCells(1, 5, 1, 7)
    ws.getCell(1, 5).fill = FILL_AMBER
    // พรบ.: cols 14-20 row 1
    ws.mergeCells(1, 14, 1, 20)
    // รอบต่อประกัน: cols 21-28 row 1
    ws.mergeCells(1, 21, 1, 28)

    // Border all header cells
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 28; c++) {
        ws.getCell(r, c).border = BORDER()
      }
    }

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('th-TH') : ''

    vehicles.forEach((v, idx) => {
      const lp = parseLicensePlate(v.licensePlate)
      const rowNum = idx + 3
      const rowData = [
        idx + 1,                   // 1  NO.
        v.type || '',              // 2  ประเภท
        v.chassisNumber || '',     // 3  ตัวถัง
        v.engineNumber || '',      // 4  เครื่อง
        lp.prefix || '',           // 5  ตัวอักษรนำหน้า
        lp.number || '',           // 6  หมายเลข
        lp.province || '',         // 7  จังหวัด
        v.nextMileage ?? '',       // 8  ไมล์ถัดไป
        v.currentMileage ?? '',    // 9  ไมล์ปัจจุบัน
        (v.nextMileage != null && v.currentMileage != null) ? v.nextMileage - v.currentMileage : '', // 10 ระยะเกิน
        v.status === 'ACTIVE' ? 'พร้อมใช้งาน' : v.status === 'IN_USE' ? 'กำลังใช้งาน' : v.status === 'MAINTENANCE' ? 'ซ่อมบำรุง' : 'ปลดระวาง', // 11
        v.note || '',              // 12 หมายเหตุ
        fmtDate(v.taxRenewalDate), // 13 รอบต่อภาษี
        // พรบ. (14-20)
        v.prbLmg ? '✓' : '', v.prbViriya ? '✓' : '', v.prbAkney ? '✓' : '', v.prbThewet ? '✓' : '',
        v.prbInsurance ? '✓' : '', v.prbBangkokInsurance ? '✓' : '',
        fmtDate(v.prbExpiry),
        // รอบต่อประกัน (21-28)
        v.insViriya ? '✓' : '', v.insLmg ? '✓' : '', v.insThaiInsurance ? '✓' : '',
        v.insInsurance ? '✓' : '', v.insAkney ? '✓' : '', v.insThewet ? '✓' : '',
        v.insBangkokInsurance ? '✓' : '',
        fmtDate(v.insExpiry),
      ]

      rowData.forEach((val, ci) => {
        const cell = ws.getCell(rowNum, ci + 1)
        cell.value = val
        cell.font = { name: 'TH Sarabun New', size: 12 }
        cell.alignment = {
          vertical: 'middle',
          horizontal: ci === 0 ? 'center' : typeof val === 'number' ? 'right' : val === '✓' ? 'center' : 'left',
          wrapText: true
        }
        cell.border = BORDER()
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
// Supports both new format (28 cols, plate split 5-6-7) and legacy format (26 cols, plate col 5)
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'กรุณาเลือกไฟล์ Excel' })

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.file.buffer)

    const worksheet = workbook.getWorksheet(1)
    if (!worksheet) return res.status(400).json({ error: 'ไม่พบข้อมูลในไฟล์ Excel' })

    // Detect format by checking row 2 sub-header col 5
    // New format: col5="ตัวอักษรนำหน้า", Legacy: col5="ทะเบียน"
    const row2Col5 = worksheet.getRow(2).getCell(5).value?.toString().trim() || ''
    const isNewFormat = row2Col5.includes('ตัวอักษร') || row2Col5.includes('ตัวอักษรนำหน้า')

    let imported = 0
    let skipped = 0

    // Template has 2 header rows — data starts at row 3
    for (let rowIndex = 3; rowIndex <= worksheet.rowCount; rowIndex++) {
      const row = worksheet.getRow(rowIndex)

      const typeVal = getCellValue(row.getCell(2))
      if (!typeVal) { skipped++; continue }
      const typeStr = typeVal.toString().trim()

      let licensePlate = ''
      let nextMileageCol, currentMileageCol, overMileageCol, statusCol, noteCol, taxCol
      let prbStart, insStart

      if (isNewFormat) {
        // New 28-col format
        // 5=ตัวอักษร, 6=เลข, 7=จังหวัด
        const prefix  = getCellValue(row.getCell(5))?.toString().trim() || ''
        const number  = getCellValue(row.getCell(6))?.toString().trim() || ''
        const province = getCellValue(row.getCell(7))?.toString().trim() || ''
        licensePlate = [prefix, number, province].filter(Boolean).join(' ')
        nextMileageCol = 8; currentMileageCol = 9; overMileageCol = 10
        statusCol = 11; noteCol = 12; taxCol = 13
        prbStart = 14; insStart = 21
      } else {
        // Legacy 26-col format
        const plateVal = getCellValue(row.getCell(5))
        if (!plateVal) { skipped++; continue }
        licensePlate = plateVal.toString().trim()
        nextMileageCol = 6; currentMileageCol = 7; overMileageCol = 8
        statusCol = 9; noteCol = 10; taxCol = 11
        prbStart = 12; insStart = 19
      }

      if (!typeStr || !licensePlate) { skipped++; continue }

      const g = (c) => getCellValue(row.getCell(c))
      const overMileageVal = g(overMileageCol)

      const data = {
        type:                typeStr,
        chassisNumber:       g(3)?.toString().trim() || null,
        engineNumber:        g(4)?.toString().trim() || null,
        licensePlate,
        nextMileage:         g(nextMileageCol) != null ? Number(g(nextMileageCol)) : null,
        currentMileage:      g(currentMileageCol) != null ? Number(g(currentMileageCol)) : null,
        overMileage:         overMileageVal != null ? Number(overMileageVal) : null,
        status:              mapStatus(g(statusCol)?.toString()),
        note:                g(noteCol)?.toString().trim() || null,
        taxRenewalDate:      parseDate(g(taxCol)),
        // พ.ร.บ.
        prbLmg:              parseBool(g(prbStart)),
        prbViriya:           parseBool(g(prbStart + 1)),
        prbAkney:            parseBool(g(prbStart + 2)),
        prbThewet:           parseBool(g(prbStart + 3)),
        prbInsurance:        parseBool(g(prbStart + 4)),
        prbBangkokInsurance: parseBool(g(prbStart + 5)),
        prbExpiry:           parseDate(g(prbStart + 6)),
        // รอบต่อประกัน (col order: วิริยะ LMG ไทยประกัน ประกันคุ้มภัย อาคเนย์ เทเวศ กรุงเทพ หมดอายุ)
        insViriya:           parseBool(g(insStart)),
        insLmg:              parseBool(g(insStart + 1)),
        insThaiInsurance:    parseBool(g(insStart + 2)),
        insInsurance:        parseBool(g(insStart + 3)),
        insAkney:            parseBool(g(insStart + 4)),
        insThewet:           parseBool(g(insStart + 5)),
        insBangkokInsurance: parseBool(g(insStart + 6)),
        insExpiry:           parseDate(g(insStart + 7)),
      }

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

    if (req.body.userId) {
      await logActivity(Number(req.body.userId), 'IMPORT_VEHICLES', `นำเข้ายานพาหนะ ${imported} รายการ`, 'Vehicle', null)
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
router.post('/', docUpload, async (req, res) => {
  const uploaded = {}
  try {
    const data = pickVehicleData(req.body)
    if (!data.type || !data.licensePlate) {
      return res.status(400).json({ error: 'กรุณากรอกประเภทรถและทะเบียน' })
    }
    const files = req.files || {}
    for (const field of ['photo', 'prbDoc', 'taxDoc', 'insDoc', 'gasDoc']) {
      if (files[field]?.[0]) {
        const prefix = field === 'photo' ? 'vehicle-' : 'vehicle-doc-'
        const url = await uploadToBlob(files[field][0].buffer, files[field][0].originalname, prefix)
        data[field] = uploaded[field] = url
      }
    }
    const vehicle = await prisma.vehicle.create({ data })
    if (req.body.userId) {
      await logActivity(req.body.userId, 'CREATE_VEHICLE', `เพิ่มยานพาหนะ ${data.type} ทะเบียน ${data.licensePlate}`, 'Vehicle', vehicle.id)
    }
    res.json(vehicle)
  } catch (err) {
    for (const url of Object.values(uploaded)) deletePhotoFile(url)
    if (err.code === 'P2002') return res.status(400).json({ error: 'ทะเบียนนี้มีอยู่ในระบบแล้ว' })
    res.status(500).json({ error: err.message })
  }
})

// Update vehicle
router.put('/:id', docUpload, async (req, res) => {
  const newUploads = {}
  try {
    const existing = await prisma.vehicle.findUnique({ where: { id: Number(req.params.id) } })
    const data = pickVehicleData(req.body)
    const files = req.files || {}

    // photo
    if (files.photo?.[0]) {
      if (existing?.photo) deletePhotoFile(existing.photo)
      const url = await uploadToBlob(files.photo[0].buffer, files.photo[0].originalname, 'vehicle-')
      data.photo = newUploads.photo = url
    } else if (req.body.clearPhoto === 'true') {
      if (existing?.photo) deletePhotoFile(existing.photo)
      data.photo = null
    }

    // documents
    for (const field of ['prbDoc', 'taxDoc', 'insDoc', 'gasDoc']) {
      const clearKey = 'clear' + field.charAt(0).toUpperCase() + field.slice(1)
      if (files[field]?.[0]) {
        if (existing?.[field]) deletePhotoFile(existing[field])
        const url = await uploadToBlob(files[field][0].buffer, files[field][0].originalname, 'vehicle-doc-')
        data[field] = newUploads[field] = url
      } else if (req.body[clearKey] === 'true') {
        if (existing?.[field]) deletePhotoFile(existing[field])
        data[field] = null
      }
    }

    const vehicle = await prisma.vehicle.update({ where: { id: Number(req.params.id) }, data })
    if (req.body.userId) {
      await logActivity(req.body.userId, 'UPDATE_VEHICLE', `แก้ไขยานพาหนะ ${vehicle.type} ทะเบียน ${vehicle.licensePlate}`, 'Vehicle', vehicle.id)
    }
    res.json(vehicle)
  } catch (err) {
    for (const url of Object.values(newUploads)) deletePhotoFile(url)
    res.status(500).json({ error: err.message })
  }
})

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body
    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(req.params.id) } })
    for (const field of ['photo', 'prbDoc', 'taxDoc', 'insDoc', 'gasDoc']) {
      if (vehicle?.[field]) deletePhotoFile(vehicle[field])
    }

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
