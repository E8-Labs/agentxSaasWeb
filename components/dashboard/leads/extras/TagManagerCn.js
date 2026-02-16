'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TagPill } from './LeadDetailsCN'
import { TypographyBodySemibold } from '@/lib/typography'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { Trash2 } from 'lucide-react'
import { SnackbarTypes } from '../AgentSelectSnackMessage'

const TagManagerCn = ({
  from = null,
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
  maxDisplayedTags = 1,
  onRefreshSuggestions,
  selectedUser,
  showSnackbar,
  onLeadDetailsUpdated,
}) => {
  const [showTagsPopover, setShowTagsPopover] = useState(false)
  const [deletePermanentLoader, setDeletePermanentLoader] = useState(null)
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

  const handleDeleteTagPermanently = async (tag) => {
    try {
      setDeletePermanentLoader(tag)

      let AuthToken = null
      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      if (!AuthToken) {
        console.error('No auth token found')
        return
      }


      let ApiData = {
        tagName: tag,
      }

      if (selectedUser?.id) {
        ApiData.userId = selectedUser.id
      }


      const ApiPath = Apis.delLeadTagPermanently


      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true) {
        if (showSnackbar) {
          showSnackbar(response.data.message, SnackbarTypes.Success)
        }
        // Refresh the suggestions list
        if (onRefreshSuggestions) {
          await onRefreshSuggestions()
        }
        // Update lead details to remove tag from list (lightweight update)
        if (onLeadDetailsUpdated) {
          await onLeadDetailsUpdated(tag)
        }
      }
    } catch (error) {
      console.error('Error deleting tag permanently:', error)
    } finally {
      setDeletePermanentLoader(null)
    }
  }

  return (
    <div className={`flex flex-row gap-2 ${from === "dashboardPipeline" && "w-full"}`}>
      <div className={`flex flex-row items-center gap-2 ${from === "dashboardPipeline" && "max-w-[60%]"}`}>
        {displayedTags.map((tag) => (
          <TagPill
            from={from}
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
                className="rounded-full bg-muted/60 hover:bg-muted px-2.5 py-2 text-xs font-semibold text-foreground transition-all select-none cursor-pointer border border-border/50 hover:border-border shadow-sm hover:shadow"
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
                      // from={from}
                      key={tag}
                      label={tag}
                      onRemove={handleRemoveTag}
                      isLoading={delTagLoader === tag}
                      onDeletePermanently={handleDeleteTagPermanently}
                      deletePermanentLoader={deletePermanentLoader === tag}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className={`${from === "dashboardPipeline" ? "w-[40%]" : "relative"}`}>
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
          className={`${from === "dashboardPipeline" ? "w-[100%] py-0.5" : "w-[7vw] py-2"} rounded-full border border-border/50 bg-background px-3 text-sm focus:outline-none focus:ring-0 focus:border-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors shadow-sm hover:border-border`}
        />
        {showSuggestions && tagSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-popover shadow-lg">
            {tagSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="group flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="flex-1 text-left"
                >
                  {suggestion}
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteTagPermanently(suggestion)
                  }}
                  disabled={deletePermanentLoader === suggestion}
                  className="ml-2 h-5 w-5 min-w-[20px] flex items-center justify-center hover:bg-destructive/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer opacity-0 group-hover:opacity-100"
                  aria-label={`Delete tag ${suggestion} permanently`}
                  title="Delete tag permanently"
                >
                  {deletePermanentLoader === suggestion ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                  )}
                </button>
              </div>
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
