import { useMemo, useState } from 'react'
import { createIssue, uploadIssuePicture } from '../api/issues.js'

export function useReportIssueForm({ onSubmitted, onClose } = {}) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [touched, setTouched] = useState({
    title: false,
    location: false,
    description: false,
    name: false,
  })

  const MIN = { title: 1, location: 1, description: 40, name: 2 }
  const MAX = { title: 40, description: 250 }

  function getFieldError(field, value) {
    const v = String(value ?? '').trim()
    const min = MIN[field] ?? 1
    const max = MAX[field]
    if (v.length < min) return min > 1 ? `Please enter at least ${min} characters.` : 'This field is required.'
    if (typeof max === 'number' && v.length > max) return `Please keep under ${max} characters.`
    return null
  }

  const isValid = useMemo(() => {
    return ['title', 'location', 'description', 'name'].every((f) => !getFieldError(f, { title, location, description, name }[f]))
  }, [title, location, description, name])

  function touch(field) {
    setTouched((t) => ({ ...t, [field]: true }))
  }
  function getError(field) {
    return touched[field] ? getFieldError(field, { title, location, description, name }[field]) : null
  }

  function reset() {
    setTitle('')
    setLocation('')
    setDescription('')
    setName('')
    setFile(null)
    setIsDragOver(false)
    setError(null)
    setTouched({ title: false, location: false, description: false, name: false })
    setToast(null)
  }

  function pickFile(f) {
    if (f && f.type?.startsWith('image/')) setFile(f)
  }
  function removeFile() {
    setFile(null)
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (!isValid || submitting) {
      setTouched({ title: true, location: true, description: true, name: true })
      const labels = { title: 'Title', location: 'Location', description: 'Description', name: 'Name' }
      const invalid = Object.entries({ title, location, description, name })
        .filter(([k, v]) => !!getFieldError(k, v))
        .map(([k]) => labels[k])
      const msg = invalid.length ? `Please complete: ${invalid.join(', ')}.` : 'Please complete all required fields correctly.'
      setToast(msg)
      window.clearTimeout(handleSubmit._tId)
      handleSubmit._tId = window.setTimeout(() => setToast(null), 2400)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let uploadedUrl = undefined
      if (file) {
        uploadedUrl = await uploadIssuePicture(file)
        if (!uploadedUrl) throw new Error('Upload failed')
      }
      const payload = { title, location, description, name, photoUrl: uploadedUrl }
      await createIssue(payload)
      reset()
      onSubmitted?.()
      onClose?.()
    } catch (err) {
      const msg = String(err?.message ?? '')
      if (msg.includes('HTTP 400')) {
        setError('Validation failed. Please check Title (max 40), Description (40–250), Name (min 2), and required fields.')
      } else {
        setError('Submit failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    values: { title, location, description, name },
    set: { setTitle, setLocation, setDescription, setName },
    touch,
    getError,
    isValid,
    submitting,
    error,
    toast,
    setToast,
    file,
    isDragOver,
    setIsDragOver,
    pickFile,
    removeFile,
    handleSubmit,
    reset,
  }
}

