const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const rootDir = path.resolve(__dirname, '..')
const enPath = path.join(rootDir, 'en', 'strings.json')
const jaPath = path.join(rootDir, 'ja', 'strings.json')
const outDir = path.join(rootDir, 'tmp', 'translation-tasks')

const previousEnRef =
  process.argv.find((arg) => arg.startsWith('--previous-en='))?.split('=')[1] ||
  '4d12229:en/strings.json'
const jaSource =
  process.argv.find((arg) => arg.startsWith('--ja-source='))?.split('=')[1] ||
  jaPath
const missingMode =
  process.argv.find((arg) => arg.startsWith('--missing='))?.split('=')[1] ||
  'english'
const chunkSize = Number(
  process.argv.find((arg) => arg.startsWith('--chunk-size='))?.split('=')[1] ||
    100
)

if (!['english', 'empty'].includes(missingMode)) {
  throw new Error('--missing must be "english" or "empty"')
}

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const readJsonSource = (source) => {
  if (fs.existsSync(source)) {
    return readJson(source)
  }

  return JSON.parse(
    childProcess.execFileSync('git', ['show', source], {
      cwd: rootDir,
      encoding: 'utf8'
    })
  )
}

const readPreviousEn = () => {
  try {
    return JSON.parse(
      childProcess.execFileSync('git', ['show', previousEnRef], {
        cwd: rootDir,
        encoding: 'utf8'
      })
    )
  } catch (error) {
    console.warn(`Could not read previous English file: ${previousEnRef}`)
    return {}
  }
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const getAtPath = (source, keys) => {
  let current = source
  for (const key of keys) {
    if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
      return undefined
    }
    current = current[key]
  }
  return current
}

const flattenLeaves = (source, keys = [], result = {}) => {
  if (isPlainObject(source)) {
    for (const key of Object.keys(source)) {
      flattenLeaves(source[key], keys.concat(key), result)
    }
  } else {
    result[keys.join('.')] = source
  }
  return result
}

const buildSyncedObject = (enNode, jaNode, keys = [], tasks = []) => {
  if (isPlainObject(enNode)) {
    const result = {}
    for (const key of Object.keys(enNode)) {
      result[key] = buildSyncedObject(
        enNode[key],
        isPlainObject(jaNode) ? jaNode[key] : undefined,
        keys.concat(key),
        tasks
      )
    }
    return result
  }

  const keyPath = keys.join('.')
  const previousEnValue = getAtPath(previousEn, keys)
  const hasExistingJa = jaNode !== undefined
  const englishChanged =
    previousEnValue !== undefined && previousEnValue !== enNode

  if (hasExistingJa) {
    if (englishChanged) {
      tasks.push({
        status: 'review_changed_english',
        key: keyPath,
        previousEn: previousEnValue,
        en: enNode,
        ja: jaNode
      })
    } else if (
      keyPath !== 'languageOption.label' &&
      keyPath !== 'languageOption.value' &&
      jaNode === enNode &&
      typeof enNode === 'string' &&
      /[A-Za-z]/.test(enNode)
    ) {
      tasks.push({
        status: 'review_english_text',
        key: keyPath,
        previousEn: previousEnValue,
        en: enNode,
        ja: jaNode
      })
    }
    return jaNode
  }

  tasks.push({
    status: previousEnValue === undefined ? 'translate_new_key' : 'translate_missing_key',
    key: keyPath,
    previousEn: previousEnValue,
    en: enNode,
    ja: ''
  })

  return missingMode === 'empty' ? '' : enNode
}

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

const en = readJson(enPath)
const ja = readJsonSource(jaSource)
const previousEn = readPreviousEn()
const tasks = []

const syncedJa = buildSyncedObject(en, ja, [], tasks)

if (syncedJa.languageOption) {
  syncedJa.languageOption.label = ja.languageOption?.label || 'Japanese (JP)'
  syncedJa.languageOption.value = ja.languageOption?.value || 'ja-jp'
}

writeJson(jaPath, syncedJa)

fs.mkdirSync(outDir, { recursive: true })
writeJson(path.join(outDir, 'all.json'), tasks)

for (let index = 0; index < tasks.length; index += chunkSize) {
  const chunk = tasks.slice(index, index + chunkSize)
  const chunkNumber = String(index / chunkSize + 1).padStart(3, '0')
  writeJson(path.join(outDir, `${chunkNumber}.json`), chunk)
}

const summary = tasks.reduce(
  (memo, task) => {
    memo[task.status] = (memo[task.status] || 0) + 1
    return memo
  },
  { total: tasks.length }
)

console.log(JSON.stringify(summary, null, 2))
