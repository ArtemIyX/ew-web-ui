import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(process.cwd(), 'src', 'shared', 'components')
const forbidden = /(?:>\s*|['"])(Close|Cancel|Confirm|Open|Pagination|Previous|Next|Loading|Select file|Details|Command palette|Breadcrumb|Drawer content)(?:\s*<|['"])/g
const failures = []
const menuSource = await readFile(join(process.cwd(), 'src', 'localization', 'en', 'MENU.ts'), 'utf8')
const menuTable = [...menuSource.matchAll(/'#[A-Z0-9_]+'/g)].map(([key]) => key.slice(1, -1))

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await visit(path)
    else if (entry.name.endsWith('.vue')) {
      const source = await readFile(path, 'utf8')
      for (const match of source.matchAll(forbidden)) failures.push(`${path}:${source.slice(0, match.index).split('\n').length}`)
      for (const match of source.matchAll(/menuText\(['"](#[A-Z0-9_]+)['"]\)/g)) {
        failures.push(`${path}:${source.slice(0, match.index).split('\n').length} uses a raw localization key`)
      }
    }
  }
}

for (const entry of menuTable) {
  if (!entry.startsWith('#')) failures.push(`MENU:${entry} is not a localization key`)
}

await visit(root)
if (failures.length) {
  console.error(`Unapproved shared-component copy found:\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log('Localization audit passed')
}
