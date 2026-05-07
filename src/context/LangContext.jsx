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

/** 取得系列名稱（從該系列第一筆 flash 取） */
export function getSeriesName(flash, seriesName, lang) {
  if (lang === 'zh') return seriesName
  const first = flash.find(f => f.series === seriesName)
  return (first && first[`series_${lang}`]) || seriesName
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
  tagline:      { zh:'以刺青為你譜下靈魂深處的聲音', en:'', ko:'타투로 영혼 깊은 곳의 목소리를 담아드립니다' },
  prev:         { zh:'← Prev',  en:'← Prev',      ko:'← 이전'   },
  next:         { zh:'Next →',  en:'Next →',      ko:'다음 →'   },
  // Flash
  backFlash:    { zh:'認領圖',  en:'Flash',        ko:'플래시'   },
  viewDesign:   { zh:'查看設計', en:'View Design', ko:'디자인 보기' },
  available:    { zh:'可認領',  en:'Available',    ko:'가능'     },
  taken:        { zh:'已認領',  en:'Taken',        ko:'완료'     },
  copyInquiry:  { zh:'複製詢問內文', en:'Copy Inquiry', ko:'문의 복사' },
  copied:       { zh:'已複製！', en:'Copied!',     ko:'복사됨!'  },
  goLine:       { zh:'前往 LINE 預約', en:'Book via LINE', ko:'LINE 예약' },
  takenNote:    { zh:'這張認領圖已被認領。如有興趣，歡迎透過 LINE 詢問是否有類似設計。',
                  en:'This design has been claimed. Feel free to inquire via LINE about similar designs.',
                  ko:'이 디자인은 이미 예약되었습니다. 비슷한 디자인은 LINE으로 문의해 주세요.' },
  flashCount:   { zh:'件設計', en:'designs', ko:'디자인' },
  exploreFlash: { zh:'探索系列', en:'Explore Series', ko:'시리즈 탐색' },
}

/** 尺寸字串格式化：把「約」在非中文時換成「~」 */
export function formatSize(value, lang) {
  if (!value) return value
  if (lang === 'zh') return value
  return value.replace(/約\s*/g, '~ ')
}

/** 取得靜態 UI 翻譯字串 */
export function t(key, lang) {
  const entry = UI[key]
  if (!entry) return key
  return entry[lang] ?? entry['zh'] ?? key
}
