import { CircularProgress } from '@mui/material'
import React, { useRef, useState } from 'react'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { completeCancelation } from '@/components/userPlans/UserPlanServices'
import { renderBrandedIcon } from '@/utilities/iconMasking'

function CancelationFinalStep({
  handleContinue,
  setShowSnak,
  selectedUser = null,
  onClose,
  onBack,
}) {
  const cancelPlanReasons = [
    { id: 1, reason: 'It’s too expensive' },
    { id: 2, reason: 'I’m using something else' },
    { id: 3, reason: 'I’m not getting the results I expected' },
    { id: 4, reason: 'It’s too complicated to use' },
    { id: 5, reason: 'Others' },
  ]

  const textFieldRef = useRef(null)
  const [selectReason, setSelectReason] = useState('')
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false)
  const [otherReasonInput, setOtherReasonInput] = useState('')
  const [loading, setloading] = useState(false)
  const [showError, setShowError] = useState(null)

  const canSubmit =
    Boolean(selectReason) &&
    (selectReason !== 'Others' || Boolean(otherReasonInput?.trim()))

  const handleSelectReason = (item) => {
    setSelectReason(item.reason)
    if (item.reason === 'Others') {
      setShowOtherReasonInput(true)
      setTimeout(() => {
        textFieldRef.current?.focus()
      }, 300)
      return
    }
    setShowOtherReasonInput(false)
    setOtherReasonInput('')
  }

  const handleCancel = async () => {
    if (!canSubmit || loading) return
    setloading(true)
    let response = null
    const reason = selectReason === 'Others' ? otherReasonInput.trim() : selectReason

    try {
      if (selectedUser) {
        response = await completeCancelation(reason, selectedUser)
      } else {
        response = await completeCancelation(reason)
      }
      const nextAction = 'closeModel'
      handleContinue(nextAction)
      setShowSnak(response.message, SnackbarTypes.Success)
      return response
    } finally {
      setloading(false)
    }
  }

  return (
    <div className="flex h-auto flex-col">
      <AgentSelectSnackMessage
        isVisible={showError != null}
        hide={() => {
          setShowError(null)
        }}
        type={SnackbarTypes.Error}
        message={showError}
      />

      <div className="flex flex-shrink-0 flex-row items-center justify-between border-b border-[#eaeaea] px-4 py-3">
        <h2 className="pr-2 text-base font-semibold text-foreground">
          One Final Step to Cancel
        </h2>
        {onClose ? <CloseBtn onClick={onClose} /> : null}
      </div>

      <div className="overflow-x-hidden px-4 py-4 text-sm text-muted-foreground">
        <div className="flex flex-col items-center">
          {renderBrandedIcon('/otherAssets/feedbackIcon2.png', 48, 48)}
          <p className="mt-3 w-full text-center font-normal text-foreground">
            Help Us Understand What’s Missing!
          </p>
        </div>

        <div
          className="mt-4 w-full"
          role="radiogroup"
          aria-label="Cancellation reason"
        >
          {cancelPlanReasons.map((item, index) => {
            const selected = item.reason === selectReason
            return (
              <button
                type="button"
                onClick={() => {
                  handleSelectReason(item)
                }}
                key={item.id ?? index}
                className="mt-1.5 flex w-full flex-row items-center gap-3 rounded-md py-1.5 text-left text-[15px] font-medium text-foreground outline-none ring-brand-primary transition-colors hover:bg-muted/50 focus-visible:ring-2"
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: selected
                      ? 'hsl(var(--primary))'
                      : 'rgba(21, 21, 21, 0.1)',
                  }}
                  aria-hidden
                >
                  {selected ? (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: 'hsl(var(--primary))' }}
                    />
                  ) : null}
                </span>
                <span>{item.reason}</span>
              </button>
            )
          })}
        </div>

        {showOtherReasonInput ? (
          <div className="mt-4 w-full">
            <div className="text-base font-semibold text-foreground">
              Tell us more
            </div>
            <textarea
              ref={textFieldRef}
              placeholder="Type here"
              className="mt-3 w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              rows={4}
              value={otherReasonInput}
              onChange={(e) => {
                setOtherReasonInput(e.target.value)
              }}
              style={{ resize: 'none' }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-shrink-0 flex-row items-center justify-between gap-3 border-t border-[#eaeaea] px-4 py-3">
        <button
          type="button"
          className="flex h-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted/80 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          disabled={loading}
          onClick={() => {
            if (onBack) onBack()
          }}
        >
          Back
        </button>

        {loading ? (
          <div className="flex h-10 flex-1 items-center justify-center">
            <CircularProgress size={28} />
          </div>
        ) : (
          <button
            type="button"
            className={`ml-auto flex h-10 min-w-[160px] flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.98] sm:flex-initial ${canSubmit ? 'bg-destructive text-destructive-foreground hover:opacity-90' : 'cursor-not-allowed bg-muted text-muted-foreground'}`}
            style={{ outline: 'none' }}
            disabled={!canSubmit}
            onClick={() => {
              handleCancel()
            }}
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  )
}

export default CancelationFinalStep
