import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const textReplacements = [
  ['#212B32', '#000000'],
  ['#334155', '#000000'],
  ['#64748B', '#000000'],
  ['#94a3b8', '#000000'],
  ['#94A3B8', '#000000'],
  ['#7A9CC0', '#000000'],
  ['#7a9cc0', '#000000'],
  ['#64748b', '#000000'],
  ['#475569', '#000000'],
  ['#1e293b', '#000000'],
  ['#0f172a', '#000000'],
  ['#374151', '#000000'],
  ['#6b7280', '#000000'],
  ['#9ca3af', '#000000'],
  ['#4b5563', '#000000'],
  ['color: var(--text-secondary)', 'color: #000000'],
  ['color: var(--text-muted)',     'color: #000000'],
  ['text-gray-400', 'text-black'],
  ['text-gray-500', 'text-black'],
  ['text-gray-600', 'text-black'],
  ['text-gray-700', 'text-black'],
  ['text-slate-400', 'text-black'],
  ['text-slate-500', 'text-black'],
  ['text-slate-600', 'text-black'],
  ['text-slate-700', 'text-black'],
  ['text-muted',     'text-black'],
  ['text-secondary', 'text-black'],
]

const EXTENSIONS = new Set(['.tsx', '.ts', '.css'])
const SKIP_DIRS  = new Set(['node_modules', '.next', '.git'])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full, files)
    } else if (EXTENSIONS.has(extname(entry))) {
      files.push(full)
    }
  }
  return files
}

const files = walk(process.cwd())

let totalFiles = 0
let totalReplacements = 0

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  const original = content
  let fileReplacements = 0

  for (const [from, to] of textReplacements) {
    const regex = new RegExp(
      from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'g'
    )
    const matches = content.match(regex)
    if (matches) {
      fileReplacements += matches.length
      content = content.replace(regex, to)
    }
  }

  if (content !== original) {
    writeFileSync(file, content, 'utf8')
    totalFiles++
    totalReplacements += fileReplacements
    console.log(`Updated: ${file} (${fileReplacements} replacements)`)
  }
}

console.log('')
console.log(`Done.`)
console.log(`Files updated: ${totalFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
