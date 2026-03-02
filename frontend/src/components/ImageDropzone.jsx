import { useEffect, useMemo, useRef, useState } from 'react'

export function ImageDropzone({ file, onPick }) {
  const [active, setActive] = useState(false)
  const inputRef = useRef(null)

  const previewUrl = useMemo(() => {
    if (!file) return ''
    try {
      return URL.createObjectURL(file)
    } catch {
      return ''
    }
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl)
        } catch {
        }
      }
    }
  }, [previewUrl])

  function openPicker() {
    inputRef.current?.click()
  }
  function handleFiles(files) {
    const f = files?.[0]
    if (f && f.type?.startsWith('image/')) onPick?.(f)
  }

  return (
    <>
      <div
        className={`dropzone ${active ? 'dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setActive(true)
        }}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setActive(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPicker()
        }}
        aria-label="Drop an image here or click to select"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected photo preview" className="photo-preview__img" />
        ) : (
          <div className="photo-preview__placeholder">Drop image here or click to select</div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </>
  )
}

