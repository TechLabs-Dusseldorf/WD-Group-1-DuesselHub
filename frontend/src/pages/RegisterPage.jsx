import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { registerUser } from '../api/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { mapAuthError } from '../utils/authErrors.js'
import { TopBar } from '../components/TopBar.jsx'

const PASSWORD_RULES =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/

const DRAFT_KEY = 'register_draft'

function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      username: parsed.username ?? '',
      email: parsed.email ?? '',
    }
  } catch {
    return {}
  }
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState(null)

  const draft = readDraft()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      username: draft.username ?? '',
      email: draft.email ?? '',
      password: '',
      passwordConfirm: '',
    },
  })

  const password = watch('password')
  const watchedUsername = watch('username')
  const watchedEmail = watch('email')

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ username: watchedUsername, email: watchedEmail }),
      )
    } catch {
      // sessionStorage not available – silently ignore
    }
  }, [watchedUsername, watchedEmail])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const data = await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      })
      sessionStorage.removeItem(DRAFT_KEY)
      login(data)
      toast.success('Registration successful.')
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(mapAuthError(err))
    }
  })

  return (
    <div className="auth-page">
      <TopBar />

      <div className="auth-card">
        <h1 className="auth-card__title">Register</h1>

        <form className="auth-form" onSubmit={onSubmit} noValidate autoComplete="off">
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="off"
              className={`auth-form__input${errors.username ? ' is-invalid' : ''}`}
              {...register('username', { required: 'Username is required.' })}
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
              autoComplete="off"
              className={`auth-form__input${errors.email ? ' is-invalid' : ''}`}
              {...register('email', {
                required: 'E-mail is required.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="off"
              className={`auth-form__input${errors.password ? ' is-invalid' : ''}`}
              {...register('password', {
                required: 'Password is required.',
                validate: (v) =>
                  PASSWORD_RULES.test(String(v ?? '')) ||
                  'Password must be at least 8 characters and include upper, lower, and a special character.',
              })}
            />
            {errors.password && (
              <p className="auth-form__field-error" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="passwordConfirm">
              Confirm password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="off"
              className={`auth-form__input${errors.passwordConfirm ? ' is-invalid' : ''}`}
              {...register('passwordConfirm', {
                required: 'Please confirm your password.',
                validate: (v) => v === password || 'Passwords do not match.',
              })}
            />
            {errors.passwordConfirm && (
              <p className="auth-form__field-error" role="alert">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          {submitError && (
            <p className="form__error" role="alert">
              {submitError}
            </p>
          )}

          <div className="auth-form__actions">
            <button
              type="submit"
              className="btn btn--primary btn--large auth-form__submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>

        <p className="auth-form__footer">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
