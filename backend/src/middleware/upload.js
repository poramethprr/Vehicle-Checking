const multer = require('multer')
const path = require('path')

const imageFilter = (req, file, cb) => {
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(path.extname(file.originalname))) cb(null, true)
  else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ'))
}

const pdfImageFilter = (req, file, cb) => {
  if (/\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(path.extname(file.originalname))) cb(null, true)
  else cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพและ PDF'))
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFilter
})

const uploadWithPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: pdfImageFilter
})

module.exports = { upload, uploadWithPdf }
