// Steps 2-5: Tailwind text-color classes + inline style hex colors
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// ─── Tailwind class regex ──────────────────────────────────────────────────
// Matches any text-{color}-{shade} that is NOT white/black/inherit
const TAILWIND_PATTERN = /\btext-(gray|slate|neutral|zinc|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g

// ─── Tailwind word-level replacements ─────────────────────────────────────
const CLASS_REPLACEMENTS = [
  ['text-muted',     'text-black'],
  ['text-secondary', 'text-black'],
]

// ─── Inline style hex colors to replace ──────────────────────────────────
// All become #000000 (black)
const HEX_INLINE = [
  // greys / slates
  ["'#64748B'", "'#000000'"],
  ["'#64748b'", "'#000000'"],
  ["'#94a3b8'", "'#000000'"],
  ["'#94A3B8'", "'#000000'"],
  ["'#7A9CC0'", "'#000000'"],
  ["'#7a9cc0'", "'#000000'"],
  ["'#475569'", "'#000000'"],
  ["'#334155'", "'#000000'"],
  ["'#1e293b'", "'#000000'"],
  ["'#0f172a'", "'#000000'"],
  ["'#374151'", "'#000000'"],
  ["'#6b7280'", "'#000000'"],
  ["'#9ca3af'", "'#000000'"],
  ["'#4b5563'", "'#000000'"],
  ["'#212B32'", "'#000000'"],
  ["'#212b32'", "'#000000'"],
  // tints / accents
  ["'#AFA9EC'", "'#000000'"],
  ["'#CECBF6'", "'#000000'"],
  ["'#A8C4CC'", "'#000000'"],
  ["'#5DCAA5'", "'#000000'"],
  ["'#9FE1CB'", "'#000000'"],
  ["'#B5D4F4'", "'#000000'"],
  // named colours
  ["'gray'",    "'#000000'"],
  ["'grey'",    "'#000000'"],
  // reds / ambers / greens used as text colours
  ["'#E05C5C'", "'#000000'"],
  ["'#e05c5c'", "'#000000'"],
  ["'#C0392B'", "'#000000'"],
  ["'#c0392b'", "'#000000'"],
  ["'#BE123C'", "'#000000'"],
  ["'#be123c'", "'#000000'"],
  ["'#E8A838'", "'#000000'"],
  ["'#e8a838'", "'#000000'"],
  ["'#B7770D'", "'#000000'"],
  ["'#b7770d'", "'#000000'"],
  ["'#B45309'", "'#000000'"],
  ["'#b45309'", "'#000000'"],
  ["'#2D9E6A'", "'#000000'"],
  ["'#2d9e6a'", "'#000000'"],
  ["'#15803D'", "'#000000'"],
  ["'#15803d'", "'#000000'"],
  ["'#27500A'", "'#000000'"],
  ["'#27500a'", "'#000000'"],
  ["'#3B6D11'", "'#000000'"],
  ["'#854F0B'", "'#000000'"],
  ["'#0C447C'", "'#000000'"],
  // purples / violets used as text
  ["'#3B3486'", "'#000000'"],
  ["'#3b3486'", "'#000000'"],
  ["'#6D28D9'", "'#000000'"],
  ["'#6d28d9'", "'#000000'"],
  // blues (non-primary)
  ["'#1D4ED8'", "'#000000'"],
  ["'#1d4ed8'", "'#000000'"],
  ["'#185FA5'", "'#000000'"],
  ["'#185fa5'", "'#000000'"],
  // double-quote variants of the above
  ['"#64748B"', '"#000000"'],
  ['"#64748b"', '"#000000"'],
  ['"#94a3b8"', '"#000000"'],
  ['"#94A3B8"', '"#000000"'],
  ['"#212B32"', '"#000000"'],
  ['"#212b32"', '"#000000"'],
  ['"#E05C5C"', '"#000000"'],
  ['"#e05c5c"', '"#000000"'],
  ['"#E8A838"', '"#000000"'],
  ['"#e8a838"', '"#000000"'],
  ['"#2D9E6A"', '"#000000"'],
  ['"#2d9e6a"', '"#000000"'],
  ['"#3B3486"', '"#000000"'],
  ['"#3b3486"', '"#000000"'],
  ['"#1D4ED8"', '"#000000"'],
  ['"#185FA5"', '"#000000"'],
  ['"#B45309"', '"#000000"'],
  ['"#BE123C"', '"#000000"'],
  ['"#15803D"', '"#000000"'],
  ['"#6D28D9"', '"#000000"'],
]

// ─── FS walker ────────────────────────────────────────────────────────────
const EXTENSIONS = new Set(['.tsx', '.ts', '.css'])
const SKIP_DIRS  = new Set(['node_modules', '.next', '.git'])

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, files)
    else if (EXTENSIONS.has(extname(entry))) files.push(full)
  }
  return files
}

const files = walk(process.cwd())
let totalFiles = 0
let totalReplacements = 0

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  const original = content
  let count = 0

  // 1. Tailwind text-color classes → text-black
  const tailwindMatches = content.match(TAILWIND_PATTERN)
  if (tailwindMatches) {
    count += tailwindMatches.length
    content = content.replace(TAILWIND_PATTERN, 'text-black')
  }

  // 2. Word-level class replacements
  for (const [from, to] of CLASS_REPLACEMENTS) {
    const re = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    const m = content.match(re)
    if (m) { count += m.length; content = content.replace(re, to) }
  }

  // 3. Inline style hex replacements (context: color: '...' or color: "...")
  for (const [from, to] of HEX_INLINE) {
    const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const m = content.match(re)
    if (m) { count += m.length; content = content.replace(re, to) }
  }

  if (content !== original) {
    writeFileSync(file, content, 'utf8')
    totalFiles++
    totalReplacements += count
    console.log(`Updated: ${file} (${count} replacements)`)
  }
}

console.log('')
console.log(`Done.`)
console.log(`Files updated: ${totalFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
