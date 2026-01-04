'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TagPill } from './LeadDetailsCN'
import { TypographyBodySemibold } from '@/lib/typography'

const TagManagerCn = ({
  tags = [],
  tagInputRef,
  tagInputValue,
  onInputChange,
  onInputKeyDown,
  showSuggestions,
  setShowSuggestions,
  tagSuggestions = [],
  onSuggestionClick,
  addTagLoader,
  onRemoveTag,
  delTagLoader,
  maxDisplayedTags = 2,
}) => {
  const [showTagsPopover, setShowTagsPopover] = useState(false)
  const displayedTags = useMemo(() => tags.slice(0, maxDisplayedTags), [tags])
  const remainingCount = Math.max(0, tags.length - maxDisplayedTags)

  const handleRemoveTag = (tag) => {
    if (onRemoveTag) {
      onRemoveTag(tag)
      // Close popover if it was the last tag
      if (tags.length <= maxDisplayedTags + 1) {
        setShowTagsPopover(false)
      }
    }
  }

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {displayedTags.map((tag) => (
          <TagPill 
            key={tag} 
            label={tag} 
            onRemove={onRemoveTag}
            isLoading={delTagLoader === tag}
          />
        ))}
        {remainingCount > 0 && (
          <Popover open={showTagsPopover} onOpenChange={setShowTagsPopover}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="rounded-full bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-all select-none cursor-pointer border border-border/50 hover:border-border shadow-sm hover:shadow"
              >
                +{remainingCount}
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto min-w-[200px] max-w-[320px] p-4 shadow-lg border-border/50 !z-[1450]" 
              align="start"
              side="bottom"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-3">
                <TypographyBodySemibold className="text-sm">All Tags</TypographyBodySemibold>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <TagPill 
                      key={tag} 
                      label={tag} 
                      onRemove={handleRemoveTag}
                      isLoading={delTagLoader === tag}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="relative">
        <Input
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
          disabled={addTagLoader}
          className="w-40 rounded-full border-2 border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors shadow-sm hover:border-border"
        />

        {showSuggestions && tagSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-popover shadow-lg">
            {tagSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
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
