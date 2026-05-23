const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const jaPath = path.join(rootDir, 'ja', 'strings.json')
const taskFiles = process.argv.slice(2)

if (taskFiles.length === 0) {
  console.error('Usage: node scripts/apply-ja-translations.js tmp/translation-tasks/001.json [...]')
  process.exit(1)
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const setAtPath = (source, keyPath, value) => {
  const keys = keyPath.split('.')
  let current = source
  for (const key of keys.slice(0, -1)) {
    if (!isPlainObject(current[key])) {
      throw new Error(`Missing object path: ${keyPath}`)
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

const ja = JSON.parse(fs.readFileSync(jaPath, 'utf8'))
let applied = 0
let skipped = 0

for (const taskFile of taskFiles) {
  const tasks = JSON.parse(fs.readFileSync(path.resolve(rootDir, taskFile), 'utf8'))
  for (const task of tasks) {
    if (!task.ja || task.ja === task.en) {
      skipped += 1
      continue
    }
    setAtPath(ja, task.key, task.ja)
    applied += 1
  }
}

fs.writeFileSync(jaPath, `${JSON.stringify(ja, null, 2)}\n`)
console.log(JSON.stringify({ applied, skipped }, null, 2))
