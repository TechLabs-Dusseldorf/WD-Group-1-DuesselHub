export function FormFieldInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  minLength,
  maxLength,
  error,
  type = 'text',
  ariaDescribedById,
}) {
  const invalid = !!error
  return (
    <label className="form__field">
      <span className="form__label">{label}</span>
      <input
        type={type}
        className={`form__input ${invalid ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={ariaDescribedById}
      />
      {invalid && (
        <span id={ariaDescribedById} className="form__hint form__hint--error">
          {error}
        </span>
      )}
    </label>
  )
}

