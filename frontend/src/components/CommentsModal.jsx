import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getComments, postComment } from '../api/comments.js'
import { useAuth } from '../context/AuthContext.jsx'

function formatCommentDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatIssueDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

function normalizeComment(raw) {
  if (!raw || typeof raw !== 'object') {
    return { id: null, user: 'Unknown', text: '', createdAt: null }
  }
  return {
    id: raw._id ?? raw.id ?? null,
    user: typeof raw.user === 'string' && raw.user.trim() ? raw.user.trim() : 'Unknown',
    text: typeof raw.text === 'string' ? raw.text : '',
    createdAt: raw.createdAt ?? null,
  }
}

function getCommentKey(comment) {
  if (comment.id) return comment.id
  const fallback = `${comment.createdAt ?? ''}::${comment.user ?? ''}::${comment.text ?? ''}`
  return `comment-${fallback}`
}

function validateCommentText(value) {
  const text = String(value ?? '').trim()
  if (!text) return 'Please enter a comment.'
  if (text.length > 250) return 'Comment too long. Please keep it under 250 characters.'
  return true
}

function mapUiError(error) {
  if (error?.isNetworkError || error?.name === 'TypeError') {
    return 'Network error — could not reach the server. Please try again.'
  }
  if (error?.status === 404) return 'Issue not found.'
  if (typeof error?.status === 'number' && error.status >= 500) {
    return 'Server error — please try again in a moment.'
  }
  return error?.message ? String(error.message) : 'Something went wrong. Please try again.'
}

function extractUserLabel(user) {
  if (!user || typeof user !== 'object') return null
  const preferred = [user.username, user.name, user.email]
  const value = preferred.find((entry) => typeof entry === 'string' && entry.trim())
  return value ? value.trim() : null
}

function CommentItem({ comment }) {
  return (
    <li className="comment-item comments-list__item">
      <div className="comment-item__content">
        <div className="comment-item__meta comments-list__meta">
          <strong className="comment-item__author comments-list__author">{comment.user}</strong>
          <time
            className="comment-item__time comments-list__date"
            dateTime={comment.createdAt ?? undefined}
            title={formatCommentDate(comment.createdAt)}
          >
            {formatCommentDate(comment.createdAt)}
          </time>
        </div>
        <p className="comment-item__text comments-list__text">{comment.text}</p>
      </div>
    </li>
  )
}

function CommentsSection({ comments, isLoading, fetchError, onRetry, commentCount }) {
  return (
    <section className="comments-panel" aria-label="Comments">
      <header className="comments-panel__header">
        <h3 className="comments-panel__title">
          {typeof commentCount === 'number' ? `Comments (${commentCount})` : 'Comments'}
        </h3>
      </header>

      <div className="comments-panel__scroll comments-list__scroll">
        {isLoading && (
          <div className="state comments-panel__state" role="status" aria-live="polite">
            Loading comments…
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="state state--error comments-panel__state" role="alert">
            <p className="state__title">{fetchError}</p>
            <div className="state__actions">
              <button type="button" className="btn" onClick={onRetry}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !fetchError && comments.length === 0 && (
          <div className="state comments-panel__state comments-panel__state--empty" role="status" aria-live="polite">
            <p className="state__title">No comments yet.</p>
            <p className="state__subtitle">Be the first to comment.</p>
          </div>
        )}

        {!isLoading && !fetchError && comments.length > 0 && <CommentsList comments={comments} />}
      </div>
    </section>
  )
}

function CommentsList({ comments }) {
  return (
    <ul className="comments-list" aria-label="Comments list">
      {comments.map((comment) => (
        <CommentItem key={getCommentKey(comment)} comment={comment} />
      ))}
    </ul>
  )
}

function ComposerSection({
  onSubmit,
  textField,
  showFieldError,
  serverValidationError,
  errors,
  setServerValidationError,
  isValid,
  isSubmitting,
  textareaRef,
}) {
  return (
    <section className="comments-composer" aria-label="Add a comment">
      <form className="comments-form" onSubmit={onSubmit} noValidate>
        <div className="comments-composer__inputWrap">
          <textarea
            id="comment-textarea"
            className={`form__textarea comments-form__textarea${showFieldError ? ' is-invalid' : ''}`}
            placeholder="Write a comment…"
            maxLength={250}
            aria-label="Comment text"
            {...textField}
            onChange={(event) => {
              setServerValidationError(null)
              textField.onChange(event)
            }}
            ref={(el) => {
              textField.ref(el)
              textareaRef.current = el
            }}
          />
          <div className="comments-form__actions comments-form__actions--inside">
            <button type="submit" className="btn btn--primary" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
        <div className="comments-composer__footer">
          <div className="comments-composer__feedback">
            {(showFieldError || serverValidationError) && (
              <p className="form__hint form__hint--error" role="alert">
                {errors.text?.message || serverValidationError}
              </p>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}

export function CommentsModal({ isOpen, issue, onClose }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [serverValidationError, setServerValidationError] = useState(null)
  const titleRef = useRef(null)
  const textareaRef = useRef(null)
  const issueKey = issue?._id ?? issue?.issueKey ?? null
  const commentCount =
    typeof issue?.commentCount === 'number'
      ? issue.commentCount
      : typeof issue?.commentsCount === 'number'
        ? issue.commentsCount
        : null
  const userLabel = useMemo(() => extractUserLabel(user), [user])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting, isSubmitted },
  } = useForm({
    mode: 'onChange',
    defaultValues: { text: '' },
  })
  const textField = register('text', { validate: validateCommentText })
  const textValue = watch('text') ?? ''
  const hasTypedText = textValue.trim().length > 0
  const showFieldError = Boolean(errors.text?.message) && (isSubmitted || hasTypedText)

  const issueEndorsements = typeof issue?.endorsements === 'number' ? issue.endorsements : 0
  const issueCreatedAt = issue?.createdAt ?? null
  const issueLocation = issue?.location ?? '—'

  useEffect(() => {
    if (!isOpen) return
    setServerValidationError(null)
    clearErrors('text')
  }, [isOpen, clearErrors])

  useEffect(() => {
    if (!isOpen) return
    const focusTarget = userLabel ? textareaRef.current : titleRef.current
    focusTarget?.focus()
  }, [isOpen, userLabel])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isSubmitting, onClose])

  useEffect(() => {
    if (!isOpen || !issueKey) return

    const controller = new AbortController()
    const loadComments = async () => {
      setIsLoading(true)
      setFetchError(null)
      setComments([])
      try {
        const data = await getComments({ issueKey, signal: controller.signal })
        setComments(data.map(normalizeComment))
      } catch (error) {
        if (error?.name === 'AbortError') return
        setFetchError(mapUiError(error))
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
    return () => controller.abort()
  }, [isOpen, issueKey])

  if (!isOpen || !issue) return null

  const retryFetch = async () => {
    if (!issueKey) return
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await getComments({ issueKey })
      setComments(data.map(normalizeComment))
    } catch (error) {
      setFetchError(mapUiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const text = String(values.text ?? '').trim()
    if (!userLabel) {
      toast.info('Please log in to comment.')
      return
    }

    setServerValidationError(null)
    clearErrors('text')

    try {
      const response = await postComment({
        issueKey,
        payload: { text, user: userLabel },
      })
      const comment = response
        ? normalizeComment(response)
        : normalizeComment({
            user: userLabel,
            text,
            createdAt: new Date().toISOString(),
          })

      setComments((prev) => [comment, ...prev])
      reset({ text: '' })
      toast.success('Comment posted.')
    } catch (error) {
      if (error?.status === 400) {
        const message = error?.message || 'Comment is invalid.'
        setServerValidationError(message)
        setError('text', { type: 'server', message })
        return
      }
      if (error?.isNetworkError || error?.name === 'TypeError') {
        toast.error('Network error — could not reach the server. Please try again.')
        return
      }
      if (error?.status === 404) {
        toast.error('Issue not found.')
        return
      }
      if (typeof error?.status === 'number' && error.status >= 500) {
        toast.error('Server error — please try again in a moment.')
        return
      }
      toast.error(error?.message ? String(error.message) : 'Failed to post comment.')
    }
  })

  return (
    <div className="modal comments-modal" role="dialog" aria-modal="true" aria-label="Issue comments">
      <div
        className="modal__backdrop"
        onClick={() => {
          if (!isSubmitting) onClose?.()
        }}
      />
      <div className="modal__dialog comments-modal__dialog" role="document">
        <div className="modal__header comments-modal__header">
          <h2 id="comments-title" className="modal__title comments-modal__title" tabIndex={-1} ref={titleRef}>
            {issue.title}
          </h2>
          {issue.description && <p className="comments-modal__context">{issue.description}</p>}
          <div className="comments-modal__meta">
            <span className="comments-modal__metaItem">Endorsements: {issueEndorsements}</span>
            <span className="comments-modal__metaItem" title={issueLocation}>
              Location: {issueLocation}
            </span>
            <span className="comments-modal__metaItem">Created: {formatIssueDate(issueCreatedAt)}</span>
          </div>
          <button
            type="button"
            className="modal__close"
            aria-label="Close comments"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="comments-modal__body">
          <ComposerSection
            onSubmit={onSubmit}
            textField={textField}
            showFieldError={showFieldError}
            serverValidationError={serverValidationError}
            errors={errors}
            setServerValidationError={setServerValidationError}
            isValid={isValid}
            isSubmitting={isSubmitting}
            textareaRef={textareaRef}
          />

          <CommentsSection
            comments={comments}
            isLoading={isLoading}
            fetchError={fetchError}
            onRetry={retryFetch}
            commentCount={commentCount}
          />
        </div>
      </div>
    </div>
  )
}
