'use client'

import { useMemo } from 'react'

import { TagPill } from './LeadDetailsCN'

const TagManagerCn = ({
  tags = [],
  onCounterClick,
  tagInputRef,
  tagInputValue,
  onInputChange,
  onInputKeyDown,
  showSuggestions,
  setShowSuggestions,
  tagSuggestions = [],
  onSuggestionClick,
  addTagLoader,
  maxDisplayedTags = 2,
}) => {
  const displayedTags = useMemo(() => tags.slice(0, maxDisplayedTags), [tags])
  const remainingCount = Math.max(0, tags.length - maxDisplayedTags)

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {displayedTags.map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={onCounterClick}
            className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-foreground"
          >
            +{remainingCount}
          </button>
        )}
      </div>

      <div className="relative">
        <input
          ref={tagInputRef}
          type="text"
          value={tagInputValue}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onFocus={() => {
            if (tagInputValue.trim() && tagSuggestions.length > 0) {
              setShowSuggestions?.(true)
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions?.(false), 200)
          }}
          placeholder={tags.length > 0 ? 'Add tag...' : 'Add tags...'}
          className="w-40 rounded-full border border-muted bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          disabled={addTagLoader}
        />

        {showSuggestions && tagSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {tagSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {addTagLoader && (
          <div className="absolute right-2 top-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-brand-primary" />
          </div>
        )}
      </div>
    </div>
  )
}

export default TagManagerCn
