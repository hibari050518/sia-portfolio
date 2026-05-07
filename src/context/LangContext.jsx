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
