export function FormFieldTextarea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  minLength,
  maxLength,
  error,
  rows = 6,
  ariaDescribedById,
}) {
  const invalid = !!error
  return (
    <label className="form__field">
      <span className="form__label">{label}</span>
      <textarea
        className={`form__textarea ${invalid ? 'is-invalid' : ''}`}
        rows={rows}
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

