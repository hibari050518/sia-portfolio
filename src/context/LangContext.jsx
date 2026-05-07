import { createContext, useContext, useState, useEffect } from 'react'

const LangContext = createContext({ lang:'zh', setLang:()=>{} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('sia_lang') || 'zh' } catch { return 'zh' }
  })

  const setLang = (l) => {
    setLangState(l)
    try { localStorage.setItem('sia_lang', l) } catch {}
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

/** 取得多語欄位，空白時 fallback 到中文 */
export function gl(item, field, lang) {
  if (!item) return ''
  if (lang === 'zh') return item[field] || ''
  return item[`${field}_${lang}`] || item[field] || ''
}

/** 取得主題名稱（從該主題第一筆 work 取） */
export function getThemeName(works, themeName, lang) {
  if (lang === 'zh') return themeName
  const first = works.find(w => w.theme === themeName)
  return (first && first[`theme_${lang}`]) || themeName
}

/** 靜態 UI 字串翻譯表 */
const UI = {
  works:        { zh:'作品',    en:'Works',       ko:'작품'     },
  flash:        { zh:'認領圖',  en:'Flash',        ko:'플래시'   },
  appointments: { zh:'預約請前往主站 ↗', en:'Appointments ↗', ko:'예약 ↗' },
  viewWorks:    { zh:'查看作品', en:'View Works',  ko:'작품 보기' },
  readStory:    { zh:'閱讀故事', en:'Read Story',  ko:'스토리 읽기' },
  backWorks:    { zh:'作品集',   en:'Works',       ko:'작품집'   },
  pieces:       { zh:'件作品',   en:'works',       ko:'작품'     },
  browseWorks:  { zh:'瀏覽作品', en:'View Works',  ko:'작품 보기' },
  tagline:      { zh:'以刺青為你譜下靈魂深處的聲音', en:'', ko:'' },
  prev:         { zh:'← Prev',  en:'← Prev',      ko:'← 이전'   },
  next:         { zh:'Next →',  en:'Next →',      ko:'다음 →'   },
}

/** 取得靜態 UI 翻譯字串 */
export function t(key, lang) {
  const entry = UI[key]
  if (!entry) return key
  return entry[lang] ?? entry['zh'] ?? key
}
