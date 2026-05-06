import { useState, useEffect } from 'react'
import { fetchWorks, fetchFlash } from '../utils/sheets'

export function useWorks() {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchWorks()
      .then(setWorks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { works, loading, error }
}

export function useFlash() {
  const [flash, setFlash] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFlash()
      .then(setFlash)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { flash, loading, error }
}
