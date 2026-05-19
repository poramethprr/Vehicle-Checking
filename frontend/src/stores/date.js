/**
 * date.js — utility สำหรับจัดการวันที่ทั่วทั้งแอป
 *
 * หลักการ:
 *  - DB เก็บ ISO string ค.ศ. (UTC midnight)  เช่น "2025-11-06T00:00:00.000Z"
 *  - <input type="date"> ใช้ ค.ศ. format "YYYY-MM-DD"
 *  - แสดงผลด้วย th-TH locale → browser บวก 543 ให้อัตโนมัติ (ถูกต้องแล้ว)
 *  - การเปรียบเทียบและคำนวณวันทำใน ค.ศ. ทั้งหมด
 */

/**
 * วันนี้ในรูปแบบ "YYYY-MM-DD" ตามเวลาท้องถิ่น (ไม่ใช่ UTC)
 */
export function todayLocalStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * แปลง ISO string หรือ Date object → "YYYY-MM-DD" ตามเวลาท้องถิ่น
 * ใช้สำหรับ set ค่าใน <input type="date">
 */
export function toLocalDateStr(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * แสดงวันที่เป็นภาษาไทย (พ.ศ.) เต็มรูปแบบ
 * เช่น "6 พ.ย. 2568"
 */
export function fmtDateTh(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * แสดงวันที่ + เวลา เป็นภาษาไทย (พ.ศ.)
 * เช่น "6 พ.ย. 2568, 14:30"
 */
export function fmtDateTimeTh(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * คำนวณระยะเวลาระหว่าง 2 วัน โดยใช้ calendar จริง (ไม่ประมาณ 365/30)
 * fromStr = วันเริ่ม (เก่ากว่า), toStr = วันปลาย (ใหม่กว่า)
 * คืน string เช่น "1 ปี 2 เดือน 9 วัน"
 */
export function calendarDiffStr(fromStr, toStr) {
  const [fy, fm, fd] = fromStr.split('-').map(Number)
  const [ty, tm, td] = toStr.split('-').map(Number)

  let years = ty - fy
  let months = tm - fm
  let days = td - fd

  if (days < 0) {
    months--
    // จำนวนวันในเดือนก่อนหน้าของ toStr
    const daysInPrevMonth = new Date(ty, tm - 1, 0).getDate()
    days += daysInPrevMonth
  }
  if (months < 0) {
    years--
    months += 12
  }

  const parts = []
  if (years > 0) parts.push(`${years} ปี`)
  if (months > 0) parts.push(`${months} เดือน`)
  if (days > 0 || parts.length === 0) parts.push(`${days} วัน`)
  return parts.join(' ')
}

/**
 * คำนวณรายการแจ้งเตือนยานพาหนะที่หมดอายุหรือใกล้หมดอายุ (ภายใน daysAhead วัน)
 * ใช้ local date comparison เพื่อหลีกเลี่ยง UTC offset
 */
export function computeVehicleAlerts(vehicles, daysAhead = 14) {
  const nowStr = todayLocalStr()
  const deadlineDate = new Date()
  deadlineDate.setDate(deadlineDate.getDate() + daysAhead)
  const deadlineStr = toLocalDateStr(deadlineDate)

  const result = []

  for (const v of vehicles) {
    const checks = [
      { name: 'พ.ร.บ.', date: v.prbExpiry },
      { name: 'ประกันภัย', date: v.insExpiry },
      { name: 'ภาษี', date: v.taxRenewalDate },
    ]

    const items = []
    for (const { name, date } of checks) {
      if (!date) continue
      const expiryStr = toLocalDateStr(date)
      if (!expiryStr) continue

      // เปรียบเทียบเป็น string "YYYY-MM-DD" — ถูกต้องเสมอ ไม่มีปัญหา timezone
      if (expiryStr <= deadlineStr) {
        const daysLeft = dateDiffDays(nowStr, expiryStr)
        const isExpired = daysLeft < 0

        // คำนวณระยะเวลาแบบ calendar จริง ไม่ใช่ประมาณ 365/30
        const durationStr = isExpired
          ? calendarDiffStr(expiryStr, nowStr)   // หมดอายุแล้ว: from expiry → today
          : calendarDiffStr(nowStr, expiryStr)   // ยังไม่หมด: from today → expiry

        items.push({
          name,
          expiry: date,     // เก็บ original เพื่อแสดงผล
          expiryStr,
          daysLeft,
          isExpired,
          durationStr,      // ใช้แสดงผลใน UI แทน formatDuration
        })
      }
    }

    if (items.length > 0) {
      items.sort((a, b) => a.daysLeft - b.daysLeft)
      result.push({ vehicleId: v.id, licensePlate: v.licensePlate, type: v.type, items })
    }
  }

  result.sort((a, b) => {
    const aMin = Math.min(...a.items.map(i => i.daysLeft))
    const bMin = Math.min(...b.items.map(i => i.daysLeft))
    return aMin - bMin
  })

  return result
}

/**
 * คำนวณจำนวนวันระหว่าง 2 วัน (string "YYYY-MM-DD")
 * ค่าบวก = toStr อยู่ในอนาคต, ค่าลบ = toStr ผ่านไปแล้ว
 */
function dateDiffDays(fromStr, toStr) {
  const from = new Date(fromStr + 'T00:00:00')
  const to = new Date(toStr + 'T00:00:00')
  return Math.round((to - from) / (24 * 60 * 60 * 1000))
}
