import Papa from 'papaparse'
import { SHEET_ID, WORKS_SHEET, FLASH_SHEET } from '../config'

// 簡單記憶體快取，避免每次換頁都重新 fetch
const cache = {}

async function fetchSheet(sheetName) {
  const bust = Math.floor(Date.now() / 60000) // 每分鐘更新一次
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_=${bust}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`無法讀取工作表：${sheetName}`)
  const text = await res.text()

  const { data, errors } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
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

// 取得所有主題（去重，保持原始順序）
export function getThemes(works) {
  const seen = new Set()
  return works.map(w => w.theme).filter(t => t && !seen.has(t) && seen.add(t))
}

// 取得所有系列（去重，保持原始順序）
export function getSeries(flash) {
  const seen = new Set()
  return flash.map(f => f.series).filter(s => s && !seen.has(s) && seen.add(s))
}

// 取得部位列表（支援「手腕、腳踝」多部位）
export function getBodyParts(items) {
  const parts = new Set()
  items.forEach(item => {
    const raw = item.body_part || ''
    raw.split(/[、,，]/).forEach(p => { if (p.trim()) parts.add(p.trim()) })
  })
  return [...parts]
}
