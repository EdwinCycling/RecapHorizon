import fs from 'fs'
import { gzipSync } from 'zlib'

const inputPath = process.argv[2] || 'firebase-service-account.json'
const outputPath = process.argv[3] || ''

const buf = fs.readFileSync(inputPath)
const gz = gzipSync(buf)
const b64 = gz.toString('base64')

if (outputPath) {
  fs.writeFileSync(outputPath, b64)
  process.stdout.write(outputPath)
} else {
  process.stdout.write(b64)
}