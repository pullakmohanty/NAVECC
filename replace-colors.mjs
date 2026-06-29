import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const replacements = [
  ['#0D1B3E', '#005EB8'],
  ['#0d1b3e', '#005EB8'],
  ['#3B3486', '#005EB8'],
  ['#3b3486', '#005EB8'],
  ['#185FA5', '#005EB8'],
  ['#185fa5', '#005EB8'],
  ['#E05C5C', '#005EB8'],
  ['#e05c5c', '#005EB8'],
  ['#C0392B', '#005EB8'],
  ['#c0392b', '#005EB8'],
  ['#E8A838', '#028090'],
  ['#e8a838', '#028090'],
  ['#B7770D', '#028090'],
  ['#b7770d', '#028090'],
  ['#2D9E6A', '#028090'],
  ['#2d9e6a', '#028090'],
  ['#27500A', '#212B32'],
  ['#27500a', '#212B32'],
  ['#64748B', '#212B32'],
  ['#64748b', '#212B32'],
  ['#94a3b8', '#212B32'],
  ['#94A3B8', '#212B32'],
  ['#334155', '#212B32'],
  ['#7A9CC0', '#028090'],
  ['#7a9cc0', '#028090'],
  ['#AFA9EC', '#028090'],
  ['#CBD5E1', '#F0F4F5'],
  ['#cbd5e1', '#F0F4F5'],
  ['#E2E8F0', '#F0F4F5'],
  ['#e2e8f0', '#F0F4F5'],
  ['#F1F5F9', '#F4F7FA'],
  ['#f1f5f9', '#F4F7FA'],
  ['#FAFAFA', '#F4F7FA'],
  ['#fafafa', '#F4F7FA'],
  ['#1e3a6e', '#005EB8'],
  ['#122550', '#005EB8'],
  ['#1a2f5e', '#005EB8'],
  ['#534AB7', '#005EB8'],
  ['#CECBF6', '#F4F7FA'],
  ['#AFA9EC', '#F0F4F5'],
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

  for (const [from, to] of replacements) {
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
