import { Controller } from 'react-hook-form'
import { useReportIssueForm } from '../hooks/useReportIssueForm.js'
import { FormFieldInput } from './FormFieldInput.jsx'
import { FormFieldTextarea } from './FormFieldTextarea.jsx'
import { ImageDropzone } from './ImageDropzone.jsx'

function handleClose(form, onClose) {
  form.reset()
  onClose?.()
}

export function ReportIssueModal({ open, onClose, onSubmitted }) {
  const form = useReportIssueForm({ onSubmitted, onClose })

  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal__backdrop" onClick={() => handleClose(form, onClose)} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <h2 id="report-title" className="modal__title">Report an Issue</h2>
          <p className="modal__subtitle">Submit an issue so others can see and endorse it.</p>
          <button
            type="button"
            className="modal__close"
            aria-label="Close dialog"
            onClick={() => handleClose(form, onClose)}
          >
            ×
          </button>
        </div>

        <form className="form form--panel" onSubmit={form.onSubmit} noValidate>
          <div className="form__grid">
            <div className="form__main">
              <Controller
                name="title"
                control={form.control}
                rules={{
                  required: 'This field is required.',
                  maxLength: { value: 40, message: 'Please keep under 40 characters.' },
                }}
                render={({ field, fieldState }) => (
                  <FormFieldInput
                    label="Title"
                    placeholder="Short title"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    maxLength={40}
                    error={fieldState.isTouched ? fieldState.error?.message : null}
                    ariaDescribedById="error-title"
                  />
                )}
              />

              <Controller
                name="location"
                control={form.control}
                rules={{ required: 'This field is required.' }}
                render={({ field, fieldState }) => (
                  <FormFieldInput
                    label="Location"
                    placeholder="Street + Number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.isTouched ? fieldState.error?.message : null}
                    ariaDescribedById="error-location"
                  />
                )}
              />

              <Controller
                name="description"
                control={form.control}
                rules={{
                  required: 'This field is required.',
                  minLength: { value: 40, message: 'Please enter at least 40 characters.' },
                  maxLength: { value: 250, message: 'Please keep under 250 characters.' },
                }}
                render={({ field, fieldState }) => (
                  <FormFieldTextarea
                    label="Description"
                    placeholder="What's the issue and why is it a problem?"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    minLength={40}
                    maxLength={250}
                    error={fieldState.isTouched ? fieldState.error?.message : null}
                    ariaDescribedById="error-description"
                  />
                )}
              />

              <Controller
                name="name"
                control={form.control}
                rules={{
                  required: 'This field is required.',
                  minLength: { value: 2, message: 'Please enter at least 2 characters.' },
                }}
                render={({ field, fieldState }) => (
                  <FormFieldInput
                    label="Your name"
                    placeholder="First + Last Name"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    minLength={2}
                    error={fieldState.isTouched ? fieldState.error?.message : null}
                    ariaDescribedById="error-name"
                  />
                )}
              />
            </div>

            <div className="form__side">
              <ImageDropzone file={form.file} onPick={(f) => form.pickFile(f)} />
            </div>
          </div>

          {form.submitError && (
            <p className="form__error" role="alert">
              {form.submitError}
            </p>
          )}

          <div className="form__actions">
            <button
              type="button"
              className="btn btn--secondary btn--large btn--left"
              onClick={() => handleClose(form, onClose)}
              disabled={form.isSubmitting}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--large btn--center"
              style={{ visibility: form.file ? 'visible' : 'hidden' }}
              onClick={() => form.removeFile()}
              disabled={form.isSubmitting}
            >
              Remove image
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--large btn--right"
              disabled={!form.isValid || form.isSubmitting}
            >
              {form.isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {form.inlineToast && (
        <div className="toast toast--error" role="status" aria-live="polite">
          {form.inlineToast}
        </div>
      )}
    </div>
  )
}
