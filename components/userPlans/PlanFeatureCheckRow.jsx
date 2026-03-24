'use client'

import FeatureLine from './FeatureLine'

function PlanCheckGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Same feature row pattern as `UserPlans` pricing cards (lavender well + primary check + FeatureLine). */
export default function PlanFeatureCheckRow({
  text,
  info,
  textMax = 14,
  textMin = 10,
}) {
  return (
    <div className="flex w-full min-w-0 items-start gap-3 px-0 py-2">
      <div
        className="mt-0.5 flex flex-shrink-0 items-center justify-center rounded-full p-[2px]"
        style={{ backgroundColor: 'rgba(234,226,255,0.4)' }}
      >
        <span
          className="inline-flex h-3 w-3 items-center justify-center"
          style={{ color: 'hsl(var(--primary))' }}
        >
          <PlanCheckGlyph />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <FeatureLine
          text={text}
          info={info}
          max={textMax}
          min={textMin}
          gap={6}
          iconSize={16}
        />
      </div>
    </div>
  )
}
