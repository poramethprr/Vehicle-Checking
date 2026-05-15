const express = require('express')
const router = express.Router()
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const prisma = require('../services/prisma')
const INSPECTION_ITEMS = require('../services/inspectionItems')
const { blobNameFromUrl, generateSasUrl } = require('../services/azureBlob')
const path = require('path')
const fs = require('fs')

const LOGO_PATH = path.join(__dirname, '..', 'images', 'Logo.png')
const SGSISO_PATH = path.join(__dirname, '..', 'images', 'SGSISO.jpg')

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

// Generate a 7-day SAS URL suitable for embedding in exported files
function toExportUrl(url) {
  if (!url || !url.startsWith('https://')) return null
  try {
    const name = blobNameFromUrl(url)
    return name ? generateSasUrl(name, 7 * 24) : null
  } catch { return null }
}

// Returns an ExcelJS hyperlink object, or '' if no URL
function photoCell(url) {
  const link = toExportUrl(url)
  return link ? { text: 'ดูรูป', hyperlink: link } : ''
}

async function getMonthlyData(vehicleId, month, year) {
  const startDate = new Date(Number(year), Number(month) - 1, 1)
  const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
  const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } })
  const inspections = await prisma.inspection.findMany({
    where: { vehicleId: Number(vehicleId), inspectionDate: { gte: startDate, lte: endDate } },
    include: { user: { select: { username: true } }, details: { orderBy: { itemNumber: 'asc' } } },
    orderBy: { inspectionDate: 'asc' }
  })
  return { vehicle, inspections, daysInMonth: endDate.getDate() }
}

function buildDayMap(inspections) {
  const dayMap = {}
  for (const insp of inspections) {
    const day = new Date(insp.inspectionDate).getDate()
    dayMap[day] = {}
    for (const detail of insp.details) {
      dayMap[day][detail.itemNumber] = detail
    }
  }
  return dayMap
}

// Format abnormal notes: "วันที่ 3, 15 : รายละเอียด"
function formatAbnormalNotes(dayMap, itemNumber, daysInMonth) {
  const entries = []
  for (let d = 1; d <= daysInMonth; d++) {
    const det = dayMap[d]?.[itemNumber]
    if (det && det.status === 'ABNORMAL') {
      entries.push({ day: d, note: det.abnormalNote || '' })
    }
  }
  if (!entries.length) return ''
  const days = entries.map(e => e.day).join(', ')
  const notes = entries.filter(e => e.note).map(e => e.note)
  const uniqueNotes = [...new Set(notes)]
  if (uniqueNotes.length) {
    return 'วันที่ ' + days + ' : ' + uniqueNotes.join(', ')
  }
  return 'วันที่ ' + days
}

const thinBorder = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
}

// =====================================================
// EXCEL EXPORT
// =====================================================
router.get('/excel', async (req, res) => {
  try {
    const { vehicleId, month, year } = req.query
    if (!vehicleId || !month || !year) return res.status(400).json({ error: 'กรุณาระบุ vehicleId, month, year' })

    const { vehicle, inspections, daysInMonth } = await getMonthlyData(vehicleId, month, year)
    if (!vehicle) return res.status(404).json({ error: 'ไม่พบยานพาหนะ' })

    const dayMap = buildDayMap(inspections)
    const lastCol = daysInMonth + 3

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('ตารางบันทึกการตรวจเช็คยานพาหนะ', {
      pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1 }
    })

    // Column widths
    ws.getColumn(1).width = 8
    ws.getColumn(2).width = 35
    for (let d = 1; d <= daysInMonth; d++) ws.getColumn(d + 2).width = 3.5
    ws.getColumn(lastCol).width = 18

    const sf = { name: 'TH Sarabun New' } // base font

    // --- ROW 1: Logo (left) + Title (center) + SGSISO (right) ---
    ws.getRow(1).height = 50

    // Logo: col A-B area
    if (fs.existsSync(LOGO_PATH)) {
      const logoId = workbook.addImage({ filename: LOGO_PATH, extension: 'png' })
      ws.addImage(logoId, {
        tl: { col: 0.05, row: 0.05 },
        ext: { width: 150, height: 55 }
      })
    }

    // Title: start after col B, end before last col (leave room for SGSISO)
    const titleStart = 4  // skip a few day-cols so logo doesn't overlap
    const titleEnd = lastCol - 2
    ws.mergeCells(1, titleStart, 1, titleEnd)
    const titleCell = ws.getCell(1, titleStart)
    titleCell.value = 'ตารางบันทึกการตรวจเช็คยานพาหนะ'
    titleCell.font = { ...sf, size: 18, bold: true }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // SGSISO: col AH (lastCol), enlarged to fill properly
    if (fs.existsSync(SGSISO_PATH)) {
      const sgsisoId = workbook.addImage({ filename: SGSISO_PATH, extension: 'jpeg' })
      ws.addImage(sgsisoId, {
        tl: { col: lastCol - 1, row: 0.05 },
        ext: { width: 120, height: 55 }
      })
    }

    // --- ROW 2: ประจำเดือน / ประเภท / ทะเบียน (3 equal zones across full width) ---
    ws.getRow(2).height = 22

    // Zone 1: col 1 to 1/3
    // Zone 2: 1/3 to 2/3
    // Zone 3: 2/3 to end
    const z1e = Math.floor(lastCol / 3)
    const z2e = Math.floor(lastCol * 2 / 3)

    ws.mergeCells(2, 1, 2, z1e)
    ws.getCell(2, 1).value = `ประจำเดือน..........${THAI_MONTHS[month - 1]}  ${year}..........`
    ws.getCell(2, 1).font = { ...sf, size: 12 }
    ws.getCell(2, 1).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.mergeCells(2, z1e + 1, 2, z2e)
    ws.getCell(2, z1e + 1).value = `ประเภท..........${vehicle.type}..........`
    ws.getCell(2, z1e + 1).font = { ...sf, size: 12 }
    ws.getCell(2, z1e + 1).alignment = { horizontal: 'center', vertical: 'middle' }

    ws.mergeCells(2, z2e + 1, 2, lastCol)
    ws.getCell(2, z2e + 1).value = `ทะเบียน..........${vehicle.licensePlate}..........`
    ws.getCell(2, z2e + 1).font = { ...sf, size: 12 }
    ws.getCell(2, z2e + 1).alignment = { horizontal: 'center', vertical: 'middle' }

    // --- ROW 3: คำชี้แจง ---
    ws.getRow(3).height = 18
    ws.mergeCells(3, 1, 3, lastCol)
    ws.getCell(3, 1).value = 'คำชี้แจง : ให้ท่านลงลายเซ็นกำกับในช่องรายการที่ตรวจสอบทุกครั้งก่อนออกรถ  ( ✓ = ปกติ    ✗ = ผิดปกติ )'
    ws.getCell(3, 1).font = { ...sf, size: 10, italic: true }
    ws.getCell(3, 1).alignment = { vertical: 'middle' }

    // --- ROW 4: Header ---
    const HR = 4
    ws.getRow(HR).height = 22
    const h = ws.getRow(HR)
    h.getCell(1).value = 'รายการที่'
    h.getCell(1).font = { ...sf, size: 10, bold: true }
    h.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    h.getCell(1).border = thinBorder

    h.getCell(2).value = 'รายละเอียดการตรวจสอบสภาพรถ/ วันที่>'
    h.getCell(2).font = { ...sf, size: 10, bold: true }
    h.getCell(2).alignment = { vertical: 'middle', wrapText: true }
    h.getCell(2).border = thinBorder

    for (let d = 1; d <= daysInMonth; d++) {
      const c = h.getCell(d + 2)
      c.value = d; c.font = { ...sf, size: 8, bold: true }
      c.alignment = { horizontal: 'center', vertical: 'middle' }; c.border = thinBorder
    }
    h.getCell(lastCol).value = 'บันทึกความผิดปกติ'
    h.getCell(lastCol).font = { ...sf, size: 9, bold: true }
    h.getCell(lastCol).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    h.getCell(lastCol).border = thinBorder

    // --- ROW 6-25: Data rows ---
    for (const item of INSPECTION_ITEMS) {
      const rn = item.number + HR
      const row = ws.getRow(rn); row.height = 18

      row.getCell(1).value = item.number
      row.getCell(1).font = { ...sf, size: 10 }
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(1).border = thinBorder

      row.getCell(2).value = item.name
      row.getCell(2).font = { ...sf, size: 10 }
      row.getCell(2).alignment = { vertical: 'middle' }
      row.getCell(2).border = thinBorder

      for (let d = 1; d <= daysInMonth; d++) {
        const cell = row.getCell(d + 2)
        cell.border = thinBorder
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        const det = dayMap[d]?.[item.number]
        if (det) {
          if (det.status === 'NORMAL') {
            cell.value = '✓'; cell.font = { ...sf, size: 10, color: { argb: 'FF008000' } }
          } else {
            cell.value = '✗'; cell.font = { ...sf, size: 10, color: { argb: 'FFFF0000' }, bold: true }
          }
        }
      }

      // บันทึกความผิดปกติ: "วันที่ 3, 15"
      const noteC = row.getCell(lastCol)
      noteC.value = formatAbnormalNotes(dayMap, item.number, daysInMonth)
      noteC.font = { ...sf, size: 8 }
      noteC.alignment = { vertical: 'middle', wrapText: true }
      noteC.border = thinBorder
    }

    // --- ลงชื่อผู้ตรวจสอบ รายวัน ---
    const IR = INSPECTION_ITEMS.length + HR + 1
    ws.getRow(IR).height = 22
    ws.getCell(IR, 1).border = thinBorder
    ws.getCell(IR, 2).value = 'ลงชื่อผู้ตรวจสอบ รายวัน'
    ws.getCell(IR, 2).font = { ...sf, size: 10, bold: true }
    ws.getCell(IR, 2).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getCell(IR, 2).border = thinBorder
    for (let d = 1; d <= daysInMonth; d++) {
      ws.getCell(IR, d + 2).border = thinBorder
    }
    ws.getCell(IR, lastCol).border = thinBorder

    // fill remaining borders
    for (let r = HR; r <= IR; r++) {
      for (let c = 1; c <= lastCol; c++) {
        if (!ws.getCell(r, c).border) ws.getCell(r, c).border = thinBorder
      }
    }

    // --- Signature area ---
    const SS = IR + 2
    const sF = { ...sf, size: 11 }
    const sA = { horizontal: 'center', vertical: 'middle' }
    const zw = Math.floor(lastCol / 3)
    const sg1s = 1, sg1e = zw, sg2s = zw + 1, sg2e = zw * 2, sg3s = zw * 2 + 1, sg3e = lastCol

    const sigData = [
      ['ผู้รายงาน.............................................................', 'ผู้ตรวจสอบ.............................................................', 'ผู้อนุมัติ.............................................................'],
      ['(                                                    )', '(                                                    )', '( คุณพันธุ์สิทธิ์  ขลิบทอง )'],
      ['วันที่.............................................................', 'วันที่.............................................................', 'วันที่.............................................................']
    ]
    for (let i = 0; i < 3; i++) {
      const r = SS + i
      ws.mergeCells(r, sg1s, r, sg1e); ws.getCell(r, sg1s).value = sigData[i][0]; ws.getCell(r, sg1s).font = sF; ws.getCell(r, sg1s).alignment = sA
      ws.mergeCells(r, sg2s, r, sg2e); ws.getCell(r, sg2s).value = sigData[i][1]; ws.getCell(r, sg2s).font = sF; ws.getCell(r, sg2s).alignment = sA
      ws.mergeCells(r, sg3s, r, sg3e); ws.getCell(r, sg3s).value = sigData[i][2]; ws.getCell(r, sg3s).font = sF; ws.getCell(r, sg3s).alignment = sA
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`inspection_${vehicle.licensePlate}_${year}_${month}.xlsx`)}`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('Excel export error:', err)
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// PDF EXPORT (with multi-page support)
// =====================================================
router.get('/pdf', async (req, res) => {
  try {
    const { vehicleId, month, year } = req.query
    if (!vehicleId || !month || !year) return res.status(400).json({ error: 'กรุณาระบุ vehicleId, month, year' })

    const { vehicle, inspections, daysInMonth } = await getMonthlyData(vehicleId, month, year)
    if (!vehicle) return res.status(404).json({ error: 'ไม่พบยานพาหนะ' })

    const dayMap = buildDayMap(inspections)

    const fontPath = path.join(__dirname, '..', 'fonts', 'THSarabunNew.ttf')
    const fontBoldPath = path.join(__dirname, '..', 'fonts', 'THSarabunNew-Bold.ttf')

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 20, bufferPages: true })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`inspection_${vehicle.licensePlate}_${year}_${month}.pdf`)}`)
    doc.pipe(res)

    let hasFonts = false
    try {
      if (fs.existsSync(fontPath)) {
        doc.registerFont('ThaiFont', fontPath)
        doc.registerFont('ThaiFontBold', fontBoldPath)
        hasFonts = true
      }
    } catch (e) {}

    const fB = hasFonts ? 'ThaiFontBold' : 'Helvetica-Bold'
    const fN = hasFonts ? 'ThaiFont' : 'Helvetica'
    const pw = doc.page.width
    const ph = doc.page.height
    const mg = 20

    // Table dimensions
    const c1w = 25
    const c2w = 155
    const noteW = 80
    const dayW = (pw - 2 * mg - c1w - c2w - noteW) / daysInMonth
    const rh = 18

    function drawCheck(cx, cy, sz) {
      doc.save().strokeColor('#008000').lineWidth(1.5)
      doc.moveTo(cx - sz * 0.35, cy + sz * 0.05)
        .lineTo(cx - sz * 0.05, cy + sz * 0.35)
        .lineTo(cx + sz * 0.4, cy - sz * 0.3).stroke()
      doc.restore()
    }

    function drawX(cx, cy, sz) {
      doc.save().strokeColor('#FF0000').lineWidth(1.5)
      const s = sz * 0.28
      doc.moveTo(cx - s, cy - s).lineTo(cx + s, cy + s).stroke()
      doc.moveTo(cx + s, cy - s).lineTo(cx - s, cy + s).stroke()
      doc.restore()
    }

    // ====== Draw header (logos, title, info, note) — called per page ======
    function drawPageHeader() {
      // Logo left
      if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, mg, mg, { width: 100 })
      // SGSISO right
      if (fs.existsSync(SGSISO_PATH)) doc.image(SGSISO_PATH, pw - mg - 60, mg, { width: 60 })

      // Title center (between logos)
      doc.font(fB).fontSize(16)
        .text('ตารางบันทึกการตรวจเช็คยานพาหนะ', mg + 110, mg + 8, { width: pw - 2 * mg - 220, align: 'center' })

      // Info row (3 zones between logos)
      doc.font(fN).fontSize(11)
      const infoY = mg + 30
      const infoW = (pw - 2 * mg - 220) / 3
      doc.text(`ประจำเดือน..........${THAI_MONTHS[month - 1]}  ${year}..........`, mg + 110, infoY, { width: infoW, align: 'center' })
      doc.text(`ประเภท..........${vehicle.type}..........`, mg + 110 + infoW, infoY, { width: infoW, align: 'center' })
      doc.text(`ทะเบียน..........${vehicle.licensePlate}..........`, mg + 110 + infoW * 2, infoY, { width: infoW, align: 'center' })

      // Note with drawn check/X symbols
      const ny = mg + 50
      doc.font(fN).fontSize(9)
      const t1 = 'คำชี้แจง : ให้ท่านลงลายเซ็นกำกับในช่องรายการที่ตรวจสอบทุกครั้งก่อนออกรถ  ( '
      doc.text(t1, mg, ny)
      const t1w = doc.widthOfString(t1)
      drawCheck(mg + t1w + 5, ny + 5, 7)
      const t2x = mg + t1w + 14
      doc.text('= ปกติ    ', t2x, ny)
      const t2w = doc.widthOfString('= ปกติ    ')
      drawX(t2x + t2w + 5, ny + 5, 7)
      doc.text('= ผิดปกติ )', t2x + t2w + 14, ny)
    }

    // ====== Draw table header row ======
    function drawTableHeader(sy) {
      const sx = mg
      doc.font(fB).fontSize(9)

      doc.rect(sx, sy, c1w, rh).stroke()
      doc.text('รายการที่', sx, sy + 4, { width: c1w, align: 'center' })

      doc.rect(sx + c1w, sy, c2w, rh).stroke()
      doc.text('รายละเอียดการตรวจสอบสภาพรถ/ วันที่>', sx + c1w + 2, sy + 4, { width: c2w - 4 })

      let x = sx + c1w + c2w
      for (let d = 1; d <= daysInMonth; d++) {
        doc.rect(x, sy, dayW, rh).stroke()
        doc.text(String(d), x, sy + 4, { width: dayW, align: 'center' })
        x += dayW
      }
      doc.rect(x, sy, noteW, rh).stroke()
      doc.text('บันทึกความผิดปกติ', x + 1, sy + 4, { width: noteW - 2, align: 'center' })

      return sy + rh
    }

    // ====== Draw one data row ======
    function drawDataRow(sy, item) {
      const sx = mg
      doc.font(fN).fontSize(9)

      doc.rect(sx, sy, c1w, rh).stroke()
      doc.text(String(item.number), sx, sy + 4, { width: c1w, align: 'center' })

      doc.rect(sx + c1w, sy, c2w, rh).stroke()
      doc.text(item.name, sx + c1w + 2, sy + 4, { width: c2w - 4 })

      const abnormalEntries = []
      let x = sx + c1w + c2w
      for (let d = 1; d <= daysInMonth; d++) {
        doc.rect(x, sy, dayW, rh).stroke()
        const det = dayMap[d]?.[item.number]
        if (det) {
          const cx = x + dayW / 2, cy = sy + rh / 2
          if (det.status === 'NORMAL') drawCheck(cx, cy, 8)
          else { drawX(cx, cy, 8); abnormalEntries.push({ day: d, note: det.abnormalNote || '' }) }
        }
        x += dayW
      }

      doc.rect(x, sy, noteW, rh).stroke()
      if (abnormalEntries.length) {
        const days = abnormalEntries.map(e => e.day).join(', ')
        const notes = [...new Set(abnormalEntries.filter(e => e.note).map(e => e.note))]
        const noteText = notes.length ? 'วันที่ ' + days + ' : ' + notes.join(', ') : 'วันที่ ' + days
        doc.fontSize(6).text(noteText, x + 2, sy + 3, { width: noteW - 4 })
        doc.fontSize(9)
      }

      return sy + rh
    }

    // ====== Draw inspector row ======
    function drawInspectorRow(sy) {
      const sx = mg
      doc.rect(sx, sy, c1w, rh).stroke()
      doc.rect(sx + c1w, sy, c2w, rh).stroke()
      doc.font(fB).fontSize(9).text('ลงชื่อผู้ตรวจสอบ รายวัน', sx + c1w + 2, sy + 4, { width: c2w - 4 })
      doc.font(fN)
      let x = sx + c1w + c2w
      for (let d = 1; d <= daysInMonth; d++) {
        doc.rect(x, sy, dayW, rh).stroke()
        x += dayW
      }
      doc.rect(x, sy, noteW, rh).stroke()
      return sy + rh
    }

    // ====== Draw signature area ======
    function drawSignature(sy) {
      const dots = '.............................................................'
      const zw = (pw - 2 * mg) / 3
      const s1 = mg, s2 = mg + zw, s3 = mg + zw * 2

      sy += 15
      doc.font(fN).fontSize(11)
      doc.text('ผู้รายงาน' + dots, s1, sy, { width: zw, align: 'center' })
      doc.text('ผู้ตรวจสอบ' + dots, s2, sy, { width: zw, align: 'center' })
      doc.text('ผู้อนุมัติ' + dots, s3, sy, { width: zw, align: 'center' })

      sy += 18
      doc.text('(                                                    )', s1, sy, { width: zw, align: 'center' })
      doc.text('(                                                    )', s2, sy, { width: zw, align: 'center' })
      doc.text('( คุณพันธุ์สิทธิ์  ขลิบทอง )', s3, sy, { width: zw, align: 'center' })

      sy += 16
      doc.text('วันที่' + dots, s1, sy, { width: zw, align: 'center' })
      doc.text('วันที่' + dots, s2, sy, { width: zw, align: 'center' })
      doc.text('วันที่' + dots, s3, sy, { width: zw, align: 'center' })
    }

    // ====== RENDER PAGES ======
    const headerHeight = 65
    const tableHeaderHeight = rh
    const maxY = ph - mg - 80 // leave room for signature

    // First page header
    drawPageHeader()
    let sy = mg + headerHeight
    sy = drawTableHeader(sy)

    let itemIndex = 0
    while (itemIndex < INSPECTION_ITEMS.length) {
      // Check if we need a new page
      if (sy + rh > maxY) {
        // New page
        doc.addPage()
        drawPageHeader()
        sy = mg + headerHeight
        sy = drawTableHeader(sy)
      }

      sy = drawDataRow(sy, INSPECTION_ITEMS[itemIndex])
      itemIndex++
    }

    // Inspector row
    if (sy + rh > ph - mg - 60) {
      doc.addPage()
      drawPageHeader()
      sy = mg + headerHeight
      sy = drawTableHeader(sy)
    }
    sy = drawInspectorRow(sy)

    // Signature
    drawSignature(sy)

    doc.end()
  } catch (err) {
    console.error('PDF export error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── helpers ────────────────────────────────────────────────────────────────
const thinB = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }

function excelHeader(ws, fill = 'FFBDD7EE') {
  const colCount = ws.columns.length
  const row = ws.getRow(1)
  row.height = 24
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c)
    cell.font = { bold: true, name: 'TH Sarabun New', size: 12 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = thinB
  }
}

function styleDataRows(ws, startRow = 2) {
  const colCount = ws.columns.length
  ws.eachRow((row, rn) => {
    if (rn < startRow) return
    row.height = 18
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c)
      const isLink = cell.value && typeof cell.value === 'object' && cell.value.hyperlink
      cell.font = isLink
        ? { name: 'TH Sarabun New', size: 11, color: { argb: 'FF0563C1' }, underline: true }
        : { name: 'TH Sarabun New', size: 11 }
      cell.alignment = { vertical: 'middle', wrapText: true }
      cell.border = thinB
    }
  })
}

function fillRow(row, colCount, argb) {
  for (let c = 1; c <= colCount; c++) {
    row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
  }
}

function sendExcel(res, wb, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
  return wb.xlsx.write(res).then(() => res.end())
}

const fmtD = d => d ? new Date(d).toLocaleDateString('th-TH') : ''
const fmtDT = d => d ? new Date(d).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : ''

// ─── Export: Bookings ────────────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { startDate, endDate, vehicleId, status } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (status) where.status = status
    if (startDate || endDate) {
      where.checkoutDate = {}
      if (startDate) where.checkoutDate.gte = new Date(startDate)
      if (endDate) where.checkoutDate.lte = new Date(endDate + 'T23:59:59')
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: { select: { type: true, licensePlate: true } },
        requester: { select: { displayName: true, username: true } },
        driver: { select: { displayName: true, username: true } }
      },
      orderBy: { checkoutDate: 'asc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('รายงานการเบิก-คืนรถ')
    ws.columns = [
      { header: 'ลำดับ',           key: 'no',          width: 6  },
      { header: 'วันที่เบิก',       key: 'checkoutDate', width: 18 },
      { header: 'ยานพาหนะ',        key: 'vehicle',      width: 16 },
      { header: 'ทะเบียน',          key: 'plate',        width: 14 },
      { header: 'สถานที่ปลายทาง',   key: 'destination',  width: 24 },
      { header: 'วัตถุประสงค์',     key: 'purpose',      width: 20 },
      { header: 'ผู้เบิก',          key: 'requester',    width: 16 },
      { header: 'คนขับ',            key: 'driver',       width: 16 },
      { header: 'ไมล์ออก (กม.)',    key: 'mileageOut',   width: 13 },
      { header: 'ไมล์เข้า (กม.)',   key: 'mileageIn',    width: 13 },
      { header: 'ระยะทาง (กม.)',    key: 'distance',     width: 14 },
      { header: 'วันที่คืน',        key: 'returnDate',   width: 18 },
      { header: 'สถานะ',            key: 'status',       width: 14 },
      { header: 'หมายเหตุ',         key: 'note',         width: 22 },
      { header: 'รูปไมล์ออก',       key: 'photoOut',     width: 12 },
      { header: 'รูปไมล์เข้า',      key: 'photoIn',      width: 12 },
    ]

    const SL = { CHECKED_OUT: 'กำลังใช้งาน', RETURNED: 'คืนแล้ว', CANCELLED: 'ยกเลิก' }
    bookings.forEach((b, i) => ws.addRow({
      no: i + 1,
      checkoutDate: fmtDT(b.checkoutDate),
      vehicle: b.vehicle.type,
      plate: b.vehicle.licensePlate,
      destination: b.destination,
      purpose: b.purpose || '',
      requester: b.requester.displayName || b.requester.username,
      driver: b.driver.displayName || b.driver.username,
      mileageOut: b.mileageOut,
      mileageIn: b.mileageIn ?? '',
      distance: b.distance ?? '',
      returnDate: fmtDT(b.returnDate),
      status: SL[b.status] || b.status,
      note: b.returnNote || '',
      photoOut: photoCell(b.mileageOutPhoto),
      photoIn: photoCell(b.mileageInPhoto),
    }))

    excelHeader(ws, 'FFBDD7EE')
    styleDataRows(ws)
    await sendExcel(res, wb, `bookings_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Export: Fuel Logs ───────────────────────────────────────────────────────
router.get('/fuels', async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const fuels = await prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: { select: { type: true, licensePlate: true } },
        user: { select: { displayName: true, username: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('รายงานเติมน้ำมัน')
    ws.columns = [
      { header: 'ลำดับ',          key: 'no',         width: 6  },
      { header: 'วันที่',          key: 'date',       width: 18 },
      { header: 'ยานพาหนะ',       key: 'vehicle',    width: 16 },
      { header: 'ทะเบียน',         key: 'plate',      width: 14 },
      { header: 'ไมล์ก่อนเติม',   key: 'mileageBefore', width: 14 },
      { header: 'ไมล์หลังเติม',   key: 'mileageAfter',  width: 14 },
      { header: 'ลิตร',            key: 'liters',     width: 10 },
      { header: 'จำนวนเงิน (บ.)', key: 'amount',     width: 14 },
      { header: 'ผู้บันทึก',       key: 'user',          width: 16 },
      { header: 'หมายเหตุ',        key: 'note',          width: 20 },
      { header: 'รูปไมล์',         key: 'photoMileage',  width: 12 },
      { header: 'รูปเกจ',          key: 'photoGauge',    width: 12 },
      { header: 'รูปหัวจ่าย',      key: 'photoPump',     width: 12 },
      { header: 'รูปใบเสร็จ',      key: 'photoReceipt',  width: 12 },
    ]

    fuels.forEach((f, i) => ws.addRow({
      no: i + 1,
      date: fmtDT(f.createdAt),
      vehicle: f.vehicle.type,
      plate: f.vehicle.licensePlate,
      mileageBefore: f.mileageBefore,
      mileageAfter: f.mileageAfter ?? '',
      liters: f.liters,
      amount: f.amount,
      user: f.user.displayName || f.user.username,
      note: f.note || '',
      photoMileage: photoCell(f.mileagePhotoAfter || f.mileagePhotoBefore),
      photoGauge: photoCell(f.gaugePhotoAfter || f.gaugePhotoBefore),
      photoPump: photoCell(f.pumpPhoto),
      photoReceipt: photoCell(f.receiptPhoto),
    }))

    // Summary row
    const totalLiters = fuels.reduce((s, f) => s + f.liters, 0)
    const totalAmount = fuels.reduce((s, f) => s + f.amount, 0)
    const sumRow = ws.addRow(['', '', '', 'รวม', '', '', totalLiters.toFixed(2), totalAmount.toFixed(2), '', ''])
    sumRow.font = { bold: true, name: 'TH Sarabun New', size: 11 }
    fillRow(sumRow, ws.columns.length, 'FFE2EFDA')

    excelHeader(ws, 'FF9DC3E6')
    styleDataRows(ws)
    await sendExcel(res, wb, `fuels_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Export: Repair Requests ─────────────────────────────────────────────────
router.get('/repairs', async (req, res) => {
  try {
    const { startDate, endDate, vehicleId, status } = req.query
    const where = {}
    if (vehicleId) where.vehicleId = Number(vehicleId)
    if (status) where.status = status
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
    }

    const repairs = await prisma.repairRequest.findMany({
      where,
      include: {
        vehicle: { select: { type: true, licensePlate: true } },
        user: { select: { displayName: true, username: true } },
        approvedBy: { select: { displayName: true, username: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('รายงานแจ้งซ่อม')
    ws.columns = [
      { header: 'ลำดับ',          key: 'no',         width: 6  },
      { header: 'วันที่แจ้ง',      key: 'date',       width: 18 },
      { header: 'ยานพาหนะ',       key: 'vehicle',    width: 16 },
      { header: 'ทะเบียน',         key: 'plate',      width: 14 },
      { header: 'หัวข้อ',          key: 'title',      width: 24 },
      { header: 'รายละเอียด',      key: 'detail',     width: 30 },
      { header: 'วงเงิน (บ.)',     key: 'cost',       width: 12 },
      { header: 'สถานะ',           key: 'status',     width: 14 },
      { header: 'ผู้แจ้ง',          key: 'user',       width: 16 },
      { header: 'ผู้อนุมัติ',       key: 'approver',   width: 16 },
      { header: 'วันที่อนุมัติ',    key: 'approvedAt', width: 18 },
      { header: 'หมายเหตุผู้อนุมัติ', key: 'approverNote', width: 24 },
      { header: 'เอกสาร/รูปประกอบ',  key: 'photoDoc',     width: 16 },
    ]

    const SL = { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ', COMPLETED: 'เสร็จสิ้น' }
    repairs.forEach((r, i) => ws.addRow({
      no: i + 1,
      date: fmtDT(r.createdAt),
      vehicle: r.vehicle.type,
      plate: r.vehicle.licensePlate,
      title: r.title,
      detail: r.detail,
      cost: r.estimatedCost ?? '',
      status: SL[r.status] || r.status,
      user: r.user.displayName || r.user.username,
      approver: r.approvedBy ? (r.approvedBy.displayName || r.approvedBy.username) : '',
      approvedAt: fmtDT(r.approvedAt),
      approverNote: r.approverNote || '',
      photoDoc: photoCell(r.documentPath),
    }))

    excelHeader(ws, 'FFFCE4D6')
    styleDataRows(ws)
    await sendExcel(res, wb, `repairs_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Export: Vehicle Documents Status ───────────────────────────────────────
router.get('/vehicles-docs', async (req, res) => {
  try {
    const { docFilter } = req.query
    const vehicles = await prisma.vehicle.findMany({ orderBy: { licensePlate: 'asc' } })

    function docStatus(dateStr) {
      if (!dateStr) return 'none'
      const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
      if (days < 0) return 'expired'
      if (days <= 30) return 'warning'
      return 'ok'
    }

    function docLabel(dateStr) {
      const s = docStatus(dateStr)
      if (s === 'none') return 'ไม่ระบุ'
      const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
      if (s === 'expired') return `หมดแล้ว (${Math.abs(days)} วัน)`
      if (s === 'warning') return `ใกล้หมด (${days} วัน)`
      return `ปกติ (${days} วัน)`
    }

    let data = vehicles
    if (docFilter === 'expired') data = vehicles.filter(v => docStatus(v.prbExpiry) === 'expired' || docStatus(v.taxRenewalDate) === 'expired' || docStatus(v.insExpiry) === 'expired')
    else if (docFilter === 'warning') data = vehicles.filter(v => ['warning'].includes(docStatus(v.prbExpiry)) || ['warning'].includes(docStatus(v.taxRenewalDate)) || ['warning'].includes(docStatus(v.insExpiry)))

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('สถานะเอกสารยานพาหนะ')
    ws.columns = [
      { header: 'ลำดับ',           key: 'no',         width: 6  },
      { header: 'ประเภท',          key: 'type',       width: 18 },
      { header: 'ทะเบียน',          key: 'plate',      width: 16 },
      { header: 'สถานะรถ',          key: 'status',     width: 14 },
      { header: 'วันหมดอายุ พ.ร.บ.', key: 'prbExpiry', width: 18 },
      { header: 'สถานะ พ.ร.บ.',     key: 'prbStatus',  width: 16 },
      { header: 'เบอร์ พ.ร.บ.',     key: 'prbContact', width: 16 },
      { header: 'วันต่อภาษี',        key: 'taxDate',    width: 18 },
      { header: 'สถานะภาษี',         key: 'taxStatus',  width: 16 },
      { header: 'วันหมดอายุประกัน',  key: 'insExpiry',  width: 18 },
      { header: 'สถานะประกัน',       key: 'insStatus',  width: 16 },
      { header: 'เบอร์ประกัน',       key: 'insContact', width: 16 },
    ]

    const vSL = { ACTIVE: 'พร้อมใช้งาน', IN_USE: 'กำลังใช้งาน', MAINTENANCE: 'ซ่อมบำรุง', INACTIVE: 'ปลดระวาง' }
    data.forEach((v, i) => {
      const row = ws.addRow({
        no: i + 1,
        type: v.type,
        plate: v.licensePlate,
        status: vSL[v.status] || v.status,
        prbExpiry: fmtD(v.prbExpiry),
        prbStatus: docLabel(v.prbExpiry),
        prbContact: v.prbContact || '',
        taxDate: fmtD(v.taxRenewalDate),
        taxStatus: docLabel(v.taxRenewalDate),
        insExpiry: fmtD(v.insExpiry),
        insStatus: docLabel(v.insExpiry),
        insContact: v.insContact || ''
      })
      // Color expired rows
      const hasExpired = docStatus(v.prbExpiry) === 'expired' || docStatus(v.taxRenewalDate) === 'expired' || docStatus(v.insExpiry) === 'expired'
      const hasWarning = docStatus(v.prbExpiry) === 'warning' || docStatus(v.taxRenewalDate) === 'warning' || docStatus(v.insExpiry) === 'warning'
      const colCount = ws.columns.length
      if (hasExpired) fillRow(row, colCount, 'FFFCE4D6')
      else if (hasWarning) fillRow(row, colCount, 'FFFFF2CC')
    })

    excelHeader(ws, 'FFD6E4BC')
    styleDataRows(ws)
    await sendExcel(res, wb, `vehicles_docs_${new Date().toISOString().slice(0, 10)}.xlsx`)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Export: Combined Multi-Sheet ────────────────────────────────────────────
router.post('/combined', async (req, res) => {
  try {
    const { vehicleIds = [], topics = [], month, year, startDate: rawStart, endDate: rawEnd } = req.body
    if (!topics.length) return res.status(400).json({ error: 'กรุณาเลือกอย่างน้อย 1 หัวข้อ' })

    const vIds = vehicleIds.map(Number).filter(Boolean)
    const vehicleIdWhere = vIds.length ? { in: vIds } : undefined

    let startDate = null, endDate = null
    if (rawStart) {
      startDate = new Date(rawStart)
      endDate   = rawEnd ? new Date(rawEnd + 'T23:59:59') : new Date(rawStart + 'T23:59:59')
    } else if (year) {
      if (month) {
        startDate = new Date(Number(year), Number(month) - 1, 1)
        endDate   = new Date(Number(year), Number(month), 0, 23, 59, 59)
      } else {
        startDate = new Date(Number(year), 0, 1)
        endDate   = new Date(Number(year), 11, 31, 23, 59, 59)
      }
    }

    const wb = new ExcelJS.Workbook()

    // ── INSPECTIONS ───────────────────────────────────────────────────────────
    if (topics.includes('inspections')) {
      const where = {}
      if (vehicleIdWhere) where.vehicleId = vehicleIdWhere
      if (startDate) where.inspectionDate = { gte: startDate, lte: endDate }

      const inspections = await prisma.inspection.findMany({
        where,
        include: {
          vehicle: { select: { type: true, licensePlate: true } },
          user: { select: { displayName: true, username: true } },
          details: true
        },
        orderBy: [{ inspectionDate: 'asc' }, { vehicleId: 'asc' }]
      })

      const ws = wb.addWorksheet('การตรวจเช็ค')
      ws.columns = [
        { header: 'ลำดับ',             key: 'no',        width: 6  },
        { header: 'วันที่ตรวจ',         key: 'date',      width: 16 },
        { header: 'ยานพาหนะ',          key: 'vehicle',   width: 16 },
        { header: 'ทะเบียน',            key: 'plate',     width: 14 },
        { header: 'ผู้ตรวจ',            key: 'inspector', width: 16 },
        { header: 'ปกติ (รายการ)',      key: 'normal',    width: 14 },
        { header: 'ผิดปกติ (รายการ)',   key: 'abnormal',  width: 16 },
        { header: 'รายการผิดปกติ',       key: 'notes',     width: 50 },
      ]
      inspections.forEach((ins, i) => {
        const abnormalItems = ins.details.filter(d => d.status === 'ABNORMAL')
        ws.addRow({
          no: i + 1,
          date: fmtD(ins.inspectionDate),
          vehicle: ins.vehicle.type,
          plate: ins.vehicle.licensePlate,
          inspector: ins.user.displayName || ins.user.username,
          normal: ins.details.filter(d => d.status === 'NORMAL').length,
          abnormal: abnormalItems.length,
          notes: abnormalItems.map(d => `${d.itemNumber}.${d.itemName}${d.abnormalNote ? ': ' + d.abnormalNote : ''}`).join('; ')
        })
      })
      excelHeader(ws, 'FFD5E8F8')
      styleDataRows(ws)
    }

    // ── BOOKINGS ──────────────────────────────────────────────────────────────
    if (topics.includes('bookings')) {
      const where = {}
      if (vehicleIdWhere) where.vehicleId = vehicleIdWhere
      if (startDate) where.checkoutDate = { gte: startDate, lte: endDate }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          vehicle: { select: { type: true, licensePlate: true } },
          requester: { select: { displayName: true, username: true } },
          driver: { select: { displayName: true, username: true } }
        },
        orderBy: { checkoutDate: 'asc' }
      })

      const ws = wb.addWorksheet('การเบิก-คืนรถ')
      ws.columns = [
        { header: 'ลำดับ',           key: 'no',          width: 6  },
        { header: 'วันที่เบิก',       key: 'checkoutDate', width: 18 },
        { header: 'ยานพาหนะ',        key: 'vehicle',      width: 16 },
        { header: 'ทะเบียน',          key: 'plate',        width: 14 },
        { header: 'สถานที่ปลายทาง',   key: 'destination',  width: 24 },
        { header: 'วัตถุประสงค์',     key: 'purpose',      width: 20 },
        { header: 'ผู้เบิก',          key: 'requester',    width: 16 },
        { header: 'คนขับ',            key: 'driver',       width: 16 },
        { header: 'ไมล์ออก (กม.)',    key: 'mileageOut',   width: 13 },
        { header: 'ไมล์เข้า (กม.)',   key: 'mileageIn',    width: 13 },
        { header: 'ระยะทาง (กม.)',    key: 'distance',     width: 14 },
        { header: 'วันที่คืน',        key: 'returnDate',   width: 18 },
        { header: 'สถานะ',            key: 'status',       width: 14 },
        { header: 'หมายเหตุ',         key: 'note',         width: 22 },
        { header: 'รูปไมล์ออก',       key: 'photoOut',     width: 12 },
        { header: 'รูปไมล์เข้า',      key: 'photoIn',      width: 12 },
      ]
      const BSL = { CHECKED_OUT: 'กำลังใช้งาน', RETURNED: 'คืนแล้ว', CANCELLED: 'ยกเลิก' }
      bookings.forEach((b, i) => ws.addRow({
        no: i + 1, checkoutDate: fmtDT(b.checkoutDate),
        vehicle: b.vehicle.type, plate: b.vehicle.licensePlate,
        destination: b.destination, purpose: b.purpose || '',
        requester: b.requester.displayName || b.requester.username,
        driver: b.driver.displayName || b.driver.username,
        mileageOut: b.mileageOut, mileageIn: b.mileageIn ?? '',
        distance: b.distance ?? '', returnDate: fmtDT(b.returnDate),
        status: BSL[b.status] || b.status, note: b.returnNote || '',
        photoOut: photoCell(b.mileageOutPhoto),
        photoIn: photoCell(b.mileageInPhoto),
      }))
      excelHeader(ws, 'FFBDD7EE')
      styleDataRows(ws)
    }

    // ── FUELS ─────────────────────────────────────────────────────────────────
    if (topics.includes('fuels')) {
      const where = {}
      if (vehicleIdWhere) where.vehicleId = vehicleIdWhere
      if (startDate) where.createdAt = { gte: startDate, lte: endDate }

      const fuels = await prisma.fuelLog.findMany({
        where,
        include: {
          vehicle: { select: { type: true, licensePlate: true } },
          user: { select: { displayName: true, username: true } }
        },
        orderBy: { createdAt: 'asc' }
      })

      const ws = wb.addWorksheet('เติมน้ำมัน')
      ws.columns = [
        { header: 'ลำดับ',          key: 'no',            width: 6  },
        { header: 'วันที่',          key: 'date',          width: 18 },
        { header: 'ยานพาหนะ',       key: 'vehicle',       width: 16 },
        { header: 'ทะเบียน',         key: 'plate',         width: 14 },
        { header: 'ไมล์ก่อนเติม',   key: 'mileageBefore', width: 14 },
        { header: 'ไมล์หลังเติม',   key: 'mileageAfter',  width: 14 },
        { header: 'ลิตร',            key: 'liters',        width: 10 },
        { header: 'จำนวนเงิน (บ.)', key: 'amount',        width: 14 },
        { header: 'ผู้บันทึก',       key: 'user',          width: 16 },
        { header: 'หมายเหตุ',        key: 'note',          width: 20 },
        { header: 'รูปไมล์',         key: 'photoMileage',  width: 12 },
        { header: 'รูปเกจ',          key: 'photoGauge',    width: 12 },
        { header: 'รูปหัวจ่าย',      key: 'photoPump',     width: 12 },
        { header: 'รูปใบเสร็จ',      key: 'photoReceipt',  width: 12 },
      ]
      fuels.forEach((f, i) => ws.addRow({
        no: i + 1, date: fmtDT(f.createdAt),
        vehicle: f.vehicle.type, plate: f.vehicle.licensePlate,
        mileageBefore: f.mileageBefore, mileageAfter: f.mileageAfter ?? '',
        liters: f.liters, amount: f.amount,
        user: f.user.displayName || f.user.username, note: f.note || '',
        photoMileage: photoCell(f.mileagePhotoAfter || f.mileagePhotoBefore),
        photoGauge: photoCell(f.gaugePhotoAfter || f.gaugePhotoBefore),
        photoPump: photoCell(f.pumpPhoto),
        photoReceipt: photoCell(f.receiptPhoto),
      }))
      const totalLiters = fuels.reduce((s, f) => s + f.liters, 0)
      const totalAmount = fuels.reduce((s, f) => s + f.amount, 0)
      const sumRow = ws.addRow(['', '', '', 'รวม', '', '', totalLiters.toFixed(2), totalAmount.toFixed(2), '', ''])
      sumRow.font = { bold: true, name: 'TH Sarabun New', size: 11 }
      fillRow(sumRow, ws.columns.length, 'FFE2EFDA')
      excelHeader(ws, 'FF9DC3E6')
      styleDataRows(ws)
    }

    // ── REPAIRS ───────────────────────────────────────────────────────────────
    if (topics.includes('repairs')) {
      const where = {}
      if (vehicleIdWhere) where.vehicleId = vehicleIdWhere
      if (startDate) where.createdAt = { gte: startDate, lte: endDate }

      const repairs = await prisma.repairRequest.findMany({
        where,
        include: {
          vehicle: { select: { type: true, licensePlate: true } },
          user: { select: { displayName: true, username: true } },
          approvedBy: { select: { displayName: true, username: true } }
        },
        orderBy: { createdAt: 'asc' }
      })

      const ws = wb.addWorksheet('แจ้งซ่อม')
      ws.columns = [
        { header: 'ลำดับ',              key: 'no',          width: 6  },
        { header: 'วันที่แจ้ง',          key: 'date',        width: 18 },
        { header: 'ยานพาหนะ',           key: 'vehicle',     width: 16 },
        { header: 'ทะเบียน',             key: 'plate',       width: 14 },
        { header: 'หัวข้อ',              key: 'title',       width: 24 },
        { header: 'รายละเอียด',          key: 'detail',      width: 30 },
        { header: 'วงเงิน (บ.)',         key: 'cost',        width: 12 },
        { header: 'สถานะ',               key: 'status',      width: 14 },
        { header: 'ผู้แจ้ง',              key: 'user',        width: 16 },
        { header: 'ผู้อนุมัติ',           key: 'approver',    width: 16 },
        { header: 'วันที่อนุมัติ',        key: 'approvedAt',  width: 18 },
        { header: 'หมายเหตุผู้อนุมัติ',  key: 'approverNote', width: 24 },
        { header: 'เอกสาร/รูปประกอบ',   key: 'photoDoc',     width: 16 },
      ]
      const RSL = { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ', COMPLETED: 'เสร็จสิ้น' }
      repairs.forEach((r, i) => ws.addRow({
        no: i + 1, date: fmtDT(r.createdAt),
        vehicle: r.vehicle.type, plate: r.vehicle.licensePlate,
        title: r.title, detail: r.detail, cost: r.estimatedCost ?? '',
        status: RSL[r.status] || r.status,
        user: r.user.displayName || r.user.username,
        approver: r.approvedBy ? (r.approvedBy.displayName || r.approvedBy.username) : '',
        approvedAt: fmtDT(r.approvedAt), approverNote: r.approverNote || '',
        photoDoc: photoCell(r.documentPath),
      }))
      excelHeader(ws, 'FFFCE4D6')
      styleDataRows(ws)
    }

    // ── VEHICLE DOCS ──────────────────────────────────────────────────────────
    if (topics.includes('docs')) {
      const where = vIds.length ? { id: { in: vIds } } : {}
      const vehicles = await prisma.vehicle.findMany({ where, orderBy: { licensePlate: 'asc' } })

      function docStatus(dateStr) {
        if (!dateStr) return 'none'
        const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
        if (days < 0) return 'expired'
        if (days <= 30) return 'warning'
        return 'ok'
      }
      function docLabel(dateStr) {
        const s = docStatus(dateStr)
        if (s === 'none') return 'ไม่ระบุ'
        const days = Math.floor((new Date(dateStr) - new Date()) / 86400000)
        if (s === 'expired') return `หมดแล้ว (${Math.abs(days)} วัน)`
        if (s === 'warning') return `ใกล้หมด (${days} วัน)`
        return `ปกติ (${days} วัน)`
      }

      const ws = wb.addWorksheet('เอกสารยานพาหนะ')
      ws.columns = [
        { header: 'ลำดับ',              key: 'no',        width: 6  },
        { header: 'ประเภท',             key: 'type',      width: 18 },
        { header: 'ทะเบียน',             key: 'plate',     width: 16 },
        { header: 'สถานะรถ',             key: 'status',    width: 14 },
        { header: 'วันหมดอายุ พ.ร.บ.',  key: 'prbExpiry', width: 18 },
        { header: 'สถานะ พ.ร.บ.',       key: 'prbStatus', width: 16 },
        { header: 'วันต่อภาษี',          key: 'taxDate',   width: 18 },
        { header: 'สถานะภาษี',           key: 'taxStatus', width: 16 },
        { header: 'วันหมดอายุประกัน',    key: 'insExpiry', width: 18 },
        { header: 'สถานะประกัน',         key: 'insStatus', width: 16 },
      ]
      const vSL = { ACTIVE: 'พร้อมใช้งาน', IN_USE: 'กำลังใช้งาน', MAINTENANCE: 'ซ่อมบำรุง', INACTIVE: 'ปลดระวาง' }
      vehicles.forEach((v, i) => {
        const row = ws.addRow({
          no: i + 1, type: v.type, plate: v.licensePlate,
          status: vSL[v.status] || v.status,
          prbExpiry: fmtD(v.prbExpiry), prbStatus: docLabel(v.prbExpiry),
          taxDate: fmtD(v.taxRenewalDate), taxStatus: docLabel(v.taxRenewalDate),
          insExpiry: fmtD(v.insExpiry), insStatus: docLabel(v.insExpiry),
        })
        const hasExpired = ['prbExpiry','taxRenewalDate','insExpiry'].some(k => docStatus(v[k]) === 'expired')
        const hasWarning = ['prbExpiry','taxRenewalDate','insExpiry'].some(k => docStatus(v[k]) === 'warning')
        if (hasExpired) fillRow(row, ws.columns.length, 'FFFCE4D6')
        else if (hasWarning) fillRow(row, ws.columns.length, 'FFFFF2CC')
      })
      excelHeader(ws, 'FFD6E4BC')
      styleDataRows(ws)
    }

    if (wb.worksheets.length === 0) return res.status(400).json({ error: 'ไม่มีข้อมูลสำหรับ Export' })

    let filename
    if (rawStart && rawStart === rawEnd) {
      filename = `export_${rawStart}.xlsx`
    } else if (rawStart) {
      filename = `export_${rawStart}_ถึง_${rawEnd || rawStart}.xlsx`
    } else {
      const monthLabel = month ? THAI_MONTHS[Number(month) - 1] : 'ทั้งปี'
      filename = month ? `export_${monthLabel}_${year}.xlsx` : `export_ปี${year}.xlsx`
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`)
    await wb.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('Combined export error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
