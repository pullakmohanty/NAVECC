// Step 6: Catch-all — any remaining hex color in a color: property
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Allowed text colors — everything else gets turned black
// Exclusion list: black, white, primary blue, teal, surfaces, borders
const ALLOWED = '000000|ffffff|FFFFFF|005EB8|005eb8|028090|F0F4F5|F4F7FA|F8FFFE|E6F4F5|FAFBFC|F8FAFC|F0FBF8|F0FDF4|FFFDF5|FEF9E7|FEF2F2|EFF6FF|F5F3FF|EEEDFB|F1F5F9|F4F7FA'

// Pattern 1: inline style with quoted hex  →  color: '#xxxxxx'
const PATTERN_QUOTED = new RegExp(
  `color:\\s*['"]#(?!${ALLOWED})[0-9A-Fa-f]{6}['"]`,
  'g'
)

// Pattern 2: CSS unquoted hex  →  color: #xxxxxx
const PATTERN_UNQUOTED = new RegExp(
  `color:\\s*#(?!${ALLOWED})[0-9A-Fa-f]{6}`,
  'g'
)

// Pattern 3: rgba text colors that are not white/transparent
// (catches rgba(x,x,x,x) in color: properties)
const PATTERN_RGBA = /color:\s*rgba\(\s*(?!255\s*,\s*255\s*,\s*255)[^)]+\)/g

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
let totalFixed = 0

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  const original = content
  let count = 0

  // Reset lastIndex before each file
  PATTERN_QUOTED.lastIndex   = 0
  PATTERN_UNQUOTED.lastIndex = 0
  PATTERN_RGBA.lastIndex     = 0

  // Quoted hex
  const q = content.match(PATTERN_QUOTED)
  if (q) {
    count += q.length
    PATTERN_QUOTED.lastIndex = 0
    content = content.replace(PATTERN_QUOTED, "color: '#000000'")
  }

  // Unquoted hex (CSS)
  PATTERN_UNQUOTED.lastIndex = 0
  const u = content.match(PATTERN_UNQUOTED)
  if (u) {
    count += u.length
    PATTERN_UNQUOTED.lastIndex = 0
    content = content.replace(PATTERN_UNQUOTED, 'color: #000000')
  }

  // rgba (skip — could affect backgrounds; handled by !important in CSS)
  // Uncomment to enable:
  // const r = content.match(PATTERN_RGBA)
  // if (r) { count += r.length; PATTERN_RGBA.lastIndex = 0; content = content.replace(PATTERN_RGBA, 'color: #000000') }

  if (content !== original) {
    writeFileSync(file, content, 'utf8')
    totalFiles++
    totalFixed += count
    console.log(`Fixed ${count} in ${file}`)
  }
}

console.log('')
console.log(`Done.`)
console.log(`Files updated: ${totalFiles}`)
console.log(`Total fixed: ${totalFixed}`)
