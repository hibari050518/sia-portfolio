import Papa from 'papaparse'
import { SHEET_ID, WORKS_SHEET, FLASH_SHEET } from '../config'

// simple memory cache to avoid re-fetching on every page change
const cache = {}

async function fetchSheet(sheetName) {
  const bust = Math.floor(Date.now() / 60000) // refresh every minute
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${bust}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Cannot read sheet: ${sheetName}`)
  const text = await res.text()

  const { data, errors } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: h => h.trim(),
    transform: v => (typeof v === 'string' ? v.trim() : v),
  })
  if (errors.length) console.warn('CSV parse warnings:', errors)

  return data
}

export async function fetchWorks() {
  const rows = await fetchSheet(WORKS_SHEET)
  return rows
    .filter(r => r.visible?.trim() === 'TRUE')
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
}

export async function fetchFlash() {
  const rows = await fetchSheet(FLASH_SHEET)
  return rows
    .filter(r => r.visible?.trim() === 'TRUE')
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
}

// get all themes (deduplicated, original order)
export function getThemes(works) {
  const seen = new Set()
  return works.map(w => w.theme).filter(t => t && !seen.has(t) && seen.add(t))
}

// get all series (deduplicated, original order)
export function getSeries(flash) {
  const seen = new Set()
  return flash.map(f => f.series).filter(s => s && !seen.has(s) && seen.add(s))
}

// get body parts list (supports multi-part like "wrist, ankle")
export function getBodyParts(items) {
  const parts = new Set()
  items.forEach(item => {
    const raw = item.body_part || ''
    raw.split(/[,]/).forEach(p => { if (p.trim()) parts.add(p.trim()) })
  })
  return [...parts]
}
