import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { TopBar } from '../components/TopBar.jsx'
import { LoadingState } from '../components/LoadingState.jsx'
import { getCurrentUserProfile, updateCurrentUserProfile } from '../api/profileApi.js'
import { useAuth } from '../context/AuthContext.jsx'

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

function toFormValues(user) {
  return {
    username: user?.username ?? '',
    email: user?.email ?? '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export function ProfilePage() {
  const { updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: toFormValues(null),
  })

  const username = watch('username')
  const email = watch('email')
  const oldPassword = watch('oldPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const isPasswordChangeRequested = Boolean(oldPassword || newPassword || confirmPassword)

  useEffect(() => {
    void trigger(['oldPassword', 'newPassword', 'confirmPassword'])
  }, [oldPassword, newPassword, confirmPassword, trigger])

  const hasChanges = useMemo(() => {
    if (!profile) return false
    const normalizedUsername = String(username ?? '').trim()
    const normalizedEmail = String(email ?? '').trim()
    const baseChanged =
      normalizedUsername !== String(profile.username ?? '') ||
      normalizedEmail !== String(profile.email ?? '')

    return baseChanged || isPasswordChangeRequested
  }, [profile, username, email, isPasswordChangeRequested])

  async function loadProfile(signal) {
    setStatus('loading')
    setLoadError(null)

    try {
      const currentUser = await getCurrentUserProfile({ signal })
      setProfile(currentUser)
      reset(toFormValues(currentUser))
      setSubmitError(null)
      setIsEditMode(false)
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
  }

  function handleDiscard() {
    if (!profile) return
    reset(toFormValues(profile))
    setSubmitError(null)
    setIsEditMode(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return
    setSubmitError(null)

    const payload = {
      username: String(values.username ?? '').trim(),
      email: String(values.email ?? '').trim(),
    }

    if (isPasswordChangeRequested) {
      payload.oldPassword = values.oldPassword
      payload.currentPassword = values.oldPassword
      payload.newPassword = values.newPassword
      payload.password = values.newPassword
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
      toast.success('Profile updated successfully.')
    } catch (err) {
      setSubmitError(err?.message ?? 'Profile update failed.')
    }
  })

  return (
    <div className="app">
      <TopBar />
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
              <div className="auth-form__field">
                <label className="auth-form__label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  disabled={!isEditMode}
                  className={`auth-form__input${errors.username ? ' is-invalid' : ''}`}
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
                  className={`auth-form__input${errors.email ? ' is-invalid' : ''}`}
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

              {isEditMode && (
                <>
                  <div className="auth-form__field">
                    <label className="auth-form__label" htmlFor="oldPassword">
                      Current password
                    </label>
                    <input
                      id="oldPassword"
                      type="password"
                      className={`auth-form__input${errors.oldPassword ? ' is-invalid' : ''}`}
                      {...register('oldPassword', {
                        validate: (value) => {
                          if (!isPasswordChangeRequested) return true
                          return String(value ?? '').length > 0 || 'Please confirm your current password.'
                        },
                      })}
                    />
                    {errors.oldPassword && (
                      <p className="auth-form__field-error" role="alert">
                        {errors.oldPassword.message}
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
                      className={`auth-form__input${errors.newPassword ? ' is-invalid' : ''}`}
                      {...register('newPassword', {
                        validate: (value) => {
                          if (!isPasswordChangeRequested) return true
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
                      className={`auth-form__input${errors.confirmPassword ? ' is-invalid' : ''}`}
                      {...register('confirmPassword', {
                        validate: (value) => {
                          if (!isPasswordChangeRequested) return true
                          if (!String(value ?? '').length) return 'Please confirm your new password.'
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
                    <button
                      type="button"
                      className="btn btn--secondary btn--large auth-form__submit"
                      onClick={handleDiscard}
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="btn btn--primary btn--large auth-form__submit"
                      disabled={!isValid || !hasChanges || isSubmitting}
                    >
                      {isSubmitting ? 'Saving…' : 'Save changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
