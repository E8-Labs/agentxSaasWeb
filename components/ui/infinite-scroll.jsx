import React from 'react'

/**
 * InfiniteScroll (shadcnui-expansions style)
 * Source: https://shadcnui-expansions.typeart.cc/docs/infinite-scroll
 */
export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = '0px',
  reverse,
  children,
}) {
  const observer = React.useRef(null)

  const observerRef = React.useCallback(
    (element) => {
      let safeThreshold = threshold
      if (threshold < 0 || threshold > 1) {
        console.warn(
          'threshold should be between 0 and 1. You are exceed the range. will use default value: 1',
        )
        safeThreshold = 1
      }

      // When isLoading is true, this callback will do nothing.
      if (isLoading) return

      if (observer.current) observer.current.disconnect()
      if (!element) return

      observer.current = new IntersectionObserver(
        (entries) => {
          const first = entries && entries[0]
          if (first?.isIntersecting && hasMore) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui/infinite-scroll.jsx:39',message:'InfiniteScroll intersecting -> next()',data:{hasMore,isLoading,threshold:safeThreshold,rootMargin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'S'})}).catch(()=>{});
            // #endregion
            next()
          }
        },
        { threshold: safeThreshold, root, rootMargin },
      )
      observer.current.observe(element)
    },
    [hasMore, isLoading, next, threshold, root, rootMargin],
  )

  const flattenChildren = React.useMemo(
    () => React.Children.toArray(children),
    [children],
  )

  return (
    <>
      {flattenChildren.map((child, index) => {
        if (!React.isValidElement(child)) {
          process.env.NODE_ENV === 'development' &&
            console.warn('You should use a valid element with InfiniteScroll')
          return child
        }

        const isObserveTarget = reverse
          ? index === 0
          : index === flattenChildren.length - 1
        const ref = isObserveTarget ? observerRef : null
        // @ts-ignore ignore ref type
        return React.cloneElement(child, { ref })
      })}
    </>
  )
}

