import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { TopBar } from '../components/TopBar.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { SortChips } from '../components/SortChips.jsx'
import { IssueList } from '../components/IssueList.jsx'
import { ReportIssueModal } from '../components/ReportIssueModal.jsx'
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from '../api/profileApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useMyIssues } from '../hooks/useMyIssues.js'

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

function toFormValues(user) {
  return {
    username: user?.username ?? '',
    email: user?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export function ProfilePage() {
  const { updateUser } = useAuth()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [passwordStep, setPasswordStep] = useState('hidden')
  const [myIssuesSortKey, setMyIssuesSortKey] = useState('newest')
  const [myIssuesSearchInput, setMyIssuesSearchInput] = useState('')
  const [myIssuesSearch, setMyIssuesSearch] = useState('')

  const {
    issues: myIssues,
    loading: myIssuesLoading,
    error: myIssuesError,
    reload: reloadMyIssues,
    deleteIssue,
  } = useMyIssues({
    sortKey: myIssuesSortKey,
    search: myIssuesSearch,
  })

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: toFormValues(null),
  })

  const username = watch('username')
  const email = watch('email')
  const newPassword = watch('newPassword')
  const passwordReadyForSave = passwordStep === 'set'
  const hasPasswordChanges = passwordReadyForSave && String(newPassword ?? '').length > 0
  const isPasswordMode = isEditMode && passwordStep === 'set'

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMyIssuesSearch(String(myIssuesSearchInput ?? '').trim())
    }, 250)
    return () => window.clearTimeout(timeoutId)
  }, [myIssuesSearchInput])

  const hasChanges = useMemo(() => {
    if (!profile) return false
    if (isPasswordMode) return hasPasswordChanges
    const normalizedUsername = String(username ?? '').trim()
    const normalizedEmail = String(email ?? '').trim()
    const baseChanged =
      normalizedUsername !== String(profile.username ?? '') ||
      normalizedEmail !== String(profile.email ?? '')

    return baseChanged || hasPasswordChanges
  }, [profile, username, email, hasPasswordChanges, isPasswordMode])

  async function loadProfile(signal) {
    setStatus('loading')
    setLoadError(null)

    try {
      const currentUser = await getCurrentUserProfile({ signal })
      setProfile(currentUser)
      reset(toFormValues(currentUser))
      setSubmitError(null)
      setIsEditMode(false)
      setPasswordStep('hidden')
      setStatus('ready')
    } catch (err) {
      if (err?.name === 'AbortError') return
      setLoadError(err?.message ?? 'Profile could not be loaded.')
      setStatus('error')
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void loadProfile(controller.signal)
    return () => controller.abort()
  }, [reset])

  function handleStartEdit() {
    setSubmitError(null)
    setIsEditMode(true)
    setPasswordStep('hidden')
    if (profile) {
      reset(toFormValues(profile))
    }
  }

  function handleDiscard() {
    if (!profile) return
    reset(toFormValues(profile))
    setSubmitError(null)
    setIsEditMode(false)
    setPasswordStep('hidden')
  }

  function handleStartPasswordChange() {
    if (!isEditMode) return
    setPasswordStep('set')
    setSubmitError(null)
    resetField('currentPassword', { defaultValue: '' })
    resetField('newPassword', { defaultValue: '' })
    resetField('confirmPassword', { defaultValue: '' })
  }

  async function handleDeleteIssue(issue) {
    if (!issue?._id) return
    const issueTitle = String(issue.title ?? 'this issue')
    const confirmed = window.confirm(`Delete "${issueTitle}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteIssue(issue._id)
      toast.success('Issue deleted successfully.')
    } catch (err) {
      toast.error(err?.message ?? 'Issue could not be deleted.')
    }
  }

  function handleReportIssue() {
    setIsReportOpen(true)
  }

  function toProfileSubmitMessage(error, { includesPassword } = {}) {
    const baseMessage = String(error?.message ?? '').trim()
    if (!baseMessage) {
      return includesPassword ? 'Password update failed.' : 'Profile update failed.'
    }
    return baseMessage
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return
    setSubmitError(null)

    if (hasPasswordChanges) {
      const payload = {}
      const currentPassword = String(values.currentPassword ?? '')
      if (!currentPassword.length) {
        setSubmitError('Please enter your current password.')
        return
      }
      payload.oldPassword = currentPassword
      payload.currentPassword = currentPassword
      payload.newPassword = values.newPassword
      payload.password = values.newPassword

      try {
        const updated = await updateCurrentUserProfile(payload)
        const nextProfile = {
          id: updated.id ?? profile.id ?? null,
          username: updated.username ?? profile.username ?? '',
          email: updated.email ?? profile.email ?? '',
          role: updated.role ?? profile.role ?? null,
        }

        setProfile(nextProfile)
        updateUser(nextProfile)
        reset(toFormValues(nextProfile))
        setIsEditMode(false)
        setPasswordStep('hidden')
        toast.success('Password and profile updated successfully.')
      } catch (err) {
        const message = toProfileSubmitMessage(err, { includesPassword: true })
        setSubmitError(message)
        toast.error(message)
      }
      return
    }

    const payload = {
      username: String(values.username ?? '').trim(),
      email: String(values.email ?? '').trim(),
    }

    try {
      const updated = await updateCurrentUserProfile(payload)
      const nextProfile = {
        id: updated.id ?? profile.id ?? null,
        username: updated.username ?? payload.username,
        email: updated.email ?? payload.email,
        role: updated.role ?? profile.role ?? null,
      }

      setProfile(nextProfile)
      updateUser(nextProfile)
      reset(toFormValues(nextProfile))
      setIsEditMode(false)
      setPasswordStep('hidden')
      toast.success('Profile updated successfully.')
    } catch (err) {
      const message = toProfileSubmitMessage(err, { includesPassword: false })
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <div className="app">
      <TopBar onReportIssue={handleReportIssue} />
      <main className="container page profile-page">
        <section className="auth-card profile-card" aria-label="User profile">
          <h1 className="auth-card__title">Your profile</h1>

          {status === 'loading' && <LoadingState />}

          {status === 'error' && (
            <div className="state state--error" role="alert">
              <div className="state__title">We couldn&apos;t load your profile</div>
              <p className="state__subtitle">{loadError}</p>
              <div className="state__actions">
                <button type="button" className="btn btn--primary" onClick={() => void loadProfile()}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {status === 'ready' && (
            <form className="auth-form" onSubmit={onSubmit} noValidate autoComplete="off">
              {!isPasswordMode && (
                <>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="username">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      disabled={!isEditMode}
                      className={`auth-form__input${isEditMode ? ' auth-form__input--active' : ''}${errors.username ? ' is-invalid' : ''}`}
                      {...register('username', {
                        required: 'Username is required.',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters long.',
                        },
                      })}
                    />
                    {errors.username && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      disabled={!isEditMode}
                      className={`auth-form__input${isEditMode ? ' auth-form__input--active' : ''}${errors.email ? ' is-invalid' : ''}`}
                      {...register('email', {
                        required: 'E-mail is required.',
                        pattern: {
                          value: EMAIL_RULE,
                          message: 'Please enter a valid e-mail address.',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {isEditMode && passwordStep === 'set' && (
                <>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="currentPassword">
                      Current password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`auth-form__input auth-form__input--active${errors.currentPassword ? ' is-invalid' : ''}`}
                      {...register('currentPassword', {
                        required: 'Please enter your current password.',
                      })}
                    />
                    {errors.currentPassword && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="newPassword">
                      New password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`auth-form__input auth-form__input--active${errors.newPassword ? ' is-invalid' : ''}`}
                      {...register('newPassword', {
                        required: 'Please enter a new password.',
                        validate: (value) => {
                          return (
                            PASSWORD_RULE.test(String(value ?? '')) ||
                            'Password must be at least 8 characters and include upper, lower, and a special character.'
                          )
                        },
                      })}
                    />
                    {errors.newPassword && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="confirmPassword">
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`auth-form__input auth-form__input--active${errors.confirmPassword ? ' is-invalid' : ''}`}
                      {...register('confirmPassword', {
                        required: 'Please confirm your new password.',
                        validate: (value) => {
                          return value === newPassword || 'Passwords do not match.'
                        },
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {submitError && (
                <p className="form__error" role="alert">
                  {submitError}
                </p>
              )}

              <div className="profile-actions">
                {!isEditMode && (
                  <button
                    type="button"
                    className="btn btn--primary btn--large auth-form__submit"
                    onClick={handleStartEdit}
                  >
                    Edit profile
                  </button>
                )}

                {isEditMode && (
                  <>
                    {passwordStep !== 'set' && (
                      <button
                        type="button"
                        className="btn btn--secondary btn--large auth-form__submit"
                        onClick={handleStartPasswordChange}
                      >
                        Change Password
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--soft-danger btn--large auth-form__submit"
                      onClick={handleDiscard}
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="btn btn--primary btn--large auth-form__submit"
                      disabled={
                        !isValid ||
                        !hasChanges ||
                        isSubmitting ||
                        (passwordStep === 'set' && !hasPasswordChanges)
                      }
                    >
                      {isSubmitting ? 'Saving…' : 'Save changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </section>

        <section className="my-issues-panel" aria-label="My issues">
          <div className="my-issues-panel__header">
            <h2 className="my-issues-panel__title">My issues</h2>
            <p className="my-issues-panel__subtitle">Issues created by your account.</p>
          </div>

          <div className="my-issues-controls">
            <SortChips value={myIssuesSortKey} onChange={setMyIssuesSortKey} />
            <input
              type="search"
              className="auth-form__input auth-form__input--active"
              placeholder="Search your issues..."
              value={myIssuesSearchInput}
              onChange={(e) => setMyIssuesSearchInput(e.target.value)}
            />
          </div>

          {myIssuesLoading && <LoadingState />}

          {!myIssuesLoading && myIssuesError && (
            <div className="state state--error" role="alert">
              <div className="state__title">We couldn&apos;t load your issues</div>
              <p className="state__subtitle">{myIssuesError}</p>
              <div className="state__actions">
                <button type="button" className="btn btn--primary" onClick={() => void reloadMyIssues()}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {!myIssuesLoading && !myIssuesError && myIssues.length === 0 && (
            <div className="state state--empty">
              <div className="state__title">No issues yet</div>
              <p className="state__subtitle">You have not created any issues yet.</p>
              <div className="state__actions">
                <button type="button" className="btn" onClick={() => void reloadMyIssues()}>
                  Load again
                </button>
              </div>
            </div>
          )}

          {!myIssuesLoading && !myIssuesError && myIssues.length > 0 && (
            <IssueList issues={myIssues} onDelete={handleDeleteIssue} />
          )}
        </section>
      </main>
      <ReportIssueModal
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitted={reloadMyIssues}
      />
    </div>
  )
}
