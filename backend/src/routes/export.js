const express = require('express')
const router = express.Router()
const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const prisma = require('../services/prisma')
const INSPECTION_ITEMS = require('../services/inspectionItems')
const path = require('path')
const fs = require('fs')

const LOGO_PATH = path.join(__dirname, '..', 'images', 'Logo.png')
const SGSISO_PATH = path.join(__dirname, '..', 'images', 'SGSISO.jpg')

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

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

module.exports = router
