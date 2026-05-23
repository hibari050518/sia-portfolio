import { Fragment } from 'react'

/**
 * Render text with /br as line breaks.
 * In Google Sheets, type /br where you want a new line.
 */
export function renderText(text) {
  if (!text) return null
  const parts = String(text).split('/br')
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <br />}
    </Fragment>
  ))
}
