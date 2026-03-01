import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser } from '../api/authApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { mapAuthError } from '../utils/authErrors.js'
import { TopBar } from '../components/TopBar.jsx'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    try {
      const data = await loginUser({
        email: values.usernameOrEmail,
        password: values.password,
      })
      login(data)
      toast.success('Login successful.')
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(mapAuthError(err))
    }
  })

  return (
    <div className="auth-page">
      <TopBar />

      <div className="auth-card">
        <h1 className="auth-card__title">Login</h1>

        <form className="auth-form" onSubmit={onSubmit} noValidate autoComplete="off">
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              autoComplete="off"
              className={`auth-form__input${errors.usernameOrEmail ? ' is-invalid' : ''}`}
              {...register('usernameOrEmail', { required: 'Username or email is required.' })}
            />
            {errors.usernameOrEmail && (
              <p className="auth-form__field-error" role="alert">
                {errors.usernameOrEmail.message}
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
              {...register('password', { required: 'Password is required.' })}
            />
            {errors.password && (
              <p className="auth-form__field-error" role="alert">
                {errors.password.message}
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
              {isSubmitting ? 'Logging in…' : 'Login'}
            </button>
          </div>
        </form>

        <p className="auth-form__footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
