import { readFile } from 'node:fs/promises'
import { globSync } from 'node:fs'

const roots = ['src', 'docs']
const files = []

for (const root of roots) {
  files.push(...globSync(`${root}/**/*`, { nodir: true }))
}

const pattern = /\b\d+(?:\.\d+)?px\b/gi
const violations = []

for (const file of files.filter((file) => /\.(css|vue|ts|tsx|md|html)$/.test(file))) {
  const contents = await readFile(file, 'utf8')
  const lines = contents.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (pattern.test(line)) violations.push(`${file}:${index + 1}: ${line.trim()}`)
    pattern.lastIndex = 0
  })
}

if (violations.length > 0) {
  console.error('Numeric px lengths are not allowed:')
  console.error(violations.join('\n'))
  process.exitCode = 1
}
