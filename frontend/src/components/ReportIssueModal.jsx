import { useReportIssueForm } from '../hooks/useReportIssueForm.js'
import { FormFieldInput } from './FormFieldInput.jsx'
import { FormFieldTextarea } from './FormFieldTextarea.jsx'
import { ImageDropzone } from './ImageDropzone.jsx'

export function ReportIssueModal({ open, onClose, onSubmitted }) {
  const form = useReportIssueForm({ onSubmitted, onClose })

  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal__backdrop" onClick={() => form.reset() || onClose?.()} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <h2 id="report-title" className="modal__title">Report an Issue</h2>
          <p className="modal__subtitle">Submit an issue so others can see and endorse it.</p>
          <button
            type="button"
            className="modal__close"
            aria-label="Close dialog"
            onClick={() => form.reset() || onClose?.()}
          >
            ×
          </button>
        </div>

        <form className="form form--panel" onSubmit={form.handleSubmit}>
          <div className="form__grid">
            <div className="form__main">
              <FormFieldInput
                label="Title"
                placeholder="Short title"
                value={form.values.title}
                onChange={(e) => form.set.setTitle(e.target.value)}
                onBlur={() => form.touch('title')}
                required
                minLength={1}
                maxLength={40}
                error={form.getError('title')}
                ariaDescribedById="error-title"
              />

              <FormFieldInput
                label="Location"
                placeholder="Street + Number"
                value={form.values.location}
                onChange={(e) => form.set.setLocation(e.target.value)}
                onBlur={() => form.touch('location')}
                required
                minLength={1}
                error={form.getError('location')}
                ariaDescribedById="error-location"
              />

              <FormFieldTextarea
                label="Description"
                placeholder="What’s the issue and why is it a problem?"
                value={form.values.description}
                onChange={(e) => form.set.setDescription(e.target.value)}
                onBlur={() => form.touch('description')}
                required
                minLength={40}
                maxLength={250}
                error={form.getError('description')}
                ariaDescribedById="error-description"
              />

              <FormFieldInput
                label="Your name"
                placeholder="First + Last Name"
                value={form.values.name}
                onChange={(e) => form.set.setName(e.target.value)}
                onBlur={() => form.touch('name')}
                required
                minLength={2}
                error={form.getError('name')}
                ariaDescribedById="error-name"
              />
            </div>

            <div className="form__side">
              <ImageDropzone file={form.file} onPick={(f) => form.pickFile(f)} />
            </div>
          </div>

          {form.error && <p className="form__error" role="alert">{form.error}</p>}

          <div className="form__actions">
            <button type="button" className="btn btn--secondary btn--large btn--left" onClick={() => form.reset() || onClose?.()} disabled={form.submitting}>
              Discard
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--large btn--center"
              style={{ visibility: form.file ? 'visible' : 'hidden' }}
              onClick={() => {
                if (!form.file) return
                form.removeFile()
              }}
              disabled={form.submitting}
            >
              Remove image
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--large btn--right"
              disabled={!form.isValid || form.submitting}
            >
              {form.submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      {form.toast && (
        <div className="toast toast--error" role="status" aria-live="polite">
          {form.toast}
        </div>
      )}
    </div>
  )
}