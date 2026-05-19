const express = require('express')
const router = express.Router()
const { blobNameFromUrl, generateSasUrl } = require('../services/azureBlob')

// GET /api/media/proxy?url=<encoded_azure_blob_url>
// Generates a short-lived SAS URL and redirects — keeps container private
router.get('/proxy', (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url parameter required' })

  try {
    const blobName = blobNameFromUrl(url)
    if (!blobName) return res.status(400).json({ error: 'Not a valid Azure blob URL' })
    const sasUrl = generateSasUrl(blobName, 2)
    res.redirect(302, sasUrl)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
