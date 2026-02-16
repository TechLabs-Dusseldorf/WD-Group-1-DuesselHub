const ITEMS = [
    { key: 'newest', label: 'Newest' },
    { key: 'most-endorsed', label: 'Most endorsed' },
    { key: 'hottest', label: 'Hottest' },
]

export function SortChips({ value, onChange }) {
    return (
        <div className="chips" role="group" aria-label="Sort issues">
            {ITEMS.map((item) => {
                const isActive = value === item.key
                return (
                    <button
                        key={item.key}
                        type="button"
                        className={`chip ${isActive ? 'chip--active' : ''}`}
                        aria-pressed={isActive}
                        onClick={() => onChange?.(item.key)}
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}