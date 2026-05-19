const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob')
const path = require('path')

let _container = null

function getContainer() {
  if (!_container) {
    const client = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
    _container = client.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME)
  }
  return _container
}

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.pdf': 'application/pdf'
}

async function uploadToBlob(buffer, originalname, prefix = '') {
  const ext = path.extname(originalname).toLowerCase()
  const blobName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const blockBlobClient = getContainer().getBlockBlobClient(blobName)
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: CONTENT_TYPES[ext] || 'application/octet-stream' }
  })
  return blockBlobClient.url
}

async function deleteFromBlob(url) {
  if (!url || !url.startsWith('https://')) return
  try {
    const blobName = blobNameFromUrl(url)
    if (!blobName) return
    await getContainer().deleteBlob(blobName, { deleteSnapshots: 'include' })
  } catch {}
}

// Extract blob name from full Azure URL
function blobNameFromUrl(url) {
  if (!url || !url.startsWith('https://')) return null
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME
  const marker = `/${containerName}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  // Strip any existing SAS query string
  const nameWithQuery = url.slice(idx + marker.length)
  return nameWithQuery.split('?')[0]
}

// Generate a read-only SAS URL valid for expiresInHours
// Uses slice() to preserve base64 '==' padding in AccountKey (not split('='))
function generateSasUrl(blobName, expiresInHours = 2) {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING
  const parts = connStr.split(';')
  const accountName = parts.find(p => p.startsWith('AccountName='))?.slice('AccountName='.length)
  const accountKey = parts.find(p => p.startsWith('AccountKey='))?.slice('AccountKey='.length)
  if (!accountName || !accountKey) throw new Error('Cannot parse Azure storage credentials')

  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME

  const startsOn = new Date(Date.now() - 5 * 60 * 1000)   // 5 min ago — handles clock skew
  const expiresOn = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  const sasParams = generateBlobSASQueryParameters(
    { containerName, blobName, permissions: BlobSASPermissions.parse('r'), startsOn, expiresOn },
    sharedKeyCredential
  )
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasParams.toString()}`
}

module.exports = { uploadToBlob, deleteFromBlob, blobNameFromUrl, generateSasUrl }
