import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createIssue } from '../api/issues.js'
import { toast } from 'react-toastify'
import { extractHttpStatus } from '../utils/http.js'

export function useReportIssueForm({ onSubmitted, onClose } = {}) {
  const [file, setFile] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [inlineToast, setInlineToast] = useState(null)
  const toastTimerRef = useRef(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset: resetForm,
  } = useForm({
    mode: 'onChange',
    defaultValues: { title: '', location: '', description: '', name: '' },
  })

  function pickFile(f) {
    if (f && f.type?.startsWith('image/')) setFile(f)
  }

  function removeFile() {
    setFile(null)
  }

  function reset() {
    resetForm()
    setFile(null)
    setSubmitError(null)
    setInlineToast(null)
    clearTimeout(toastTimerRef.current)
  }

  function showInlineToast(msg) {
    setInlineToast(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setInlineToast(null), 2400)
  }

  const onSubmit = handleSubmit(
    async (values) => {
      setSubmitError(null)
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('location', values.location)
      formData.append('description', values.description)
      formData.append('name', values.name)
      if (file) formData.append('photo', file)

      try {
        await createIssue(formData)
        toast.success('Issue submitted successfully.')
        reset()
        onSubmitted?.()
        onClose?.()
      } catch (err) {
        const status = err?.status ?? extractHttpStatus(err?.message)
        const msg = String(err?.message ?? '').trim()
        const lower = msg.toLowerCase()
        const isNetworkError = msg === 'Failed to fetch' || lower.includes('network')
        const isPayloadTooLarge =
          status === 413 ||
          lower.includes('size limit') ||
          lower.includes('megabytes') ||
          lower.includes('5 megabytes')

        if (isNetworkError) {
          setSubmitError('Network error. Could not reach the server. Check your connection and try again.')
        } else if (status === 400) {
          setSubmitError(
            msg ||
            '400 Bad Request — validation failed. Please check Title (max 40), Description (40–250), Name (min 2), and required fields.',
          )
        } else if (isPayloadTooLarge) {
          setSubmitError(
            msg ||
            '413 Payload Too Large — the uploaded file is too big. Please pick an image under 5 MB.',
          )
        } else if (status === 429) {
          setSubmitError(msg || '429 Too Many Requests — please wait a moment and try again.')
        } else if (typeof status === 'number' && status >= 500) {
          setSubmitError(
            msg ||
            "500 Server error — we couldn't submit your report right now. Please try again.",
          )
        } else {
          setSubmitError(msg || 'Submit failed. Please try again.')
        }
      }
    },
    (formErrors) => {
      const labels = { title: 'Title', location: 'Location', description: 'Description', name: 'Name' }
      const names = Object.keys(formErrors).map((k) => labels[k]).filter(Boolean)
      showInlineToast(
        names.length
          ? `Please complete: ${names.join(', ')}.`
          : 'Please complete all required fields correctly.',
      )
    },
  )

  return {
    control,
    errors,
    isValid,
    isSubmitting,
    submitError,
    inlineToast,
    file,
    pickFile,
    removeFile,
    onSubmit,
    reset,
  }
}
