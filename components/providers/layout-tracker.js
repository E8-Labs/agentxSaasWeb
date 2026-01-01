'use client'

import { useEffect, useRef } from 'react'

export function LayoutTracker() {
  const hasLoggedMount = useRef(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasLoggedMount.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/layout-tracker.js:10', message: 'LayoutTracker mounted (first time only)', data: { pathname: window.location.pathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion
      hasLoggedMount.current = true
    }
  }, [])
  
  // Track when component re-renders (indicates parent re-render)
  const renderCount = useRef(0)
  renderCount.current += 1
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/layout-tracker.js:22', message: 'LayoutTracker render/effect', data: { pathname: window.location.pathname, renderCount: renderCount.current, hasLoggedMount: hasLoggedMount.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
      // #endregion
    }
  })
  
  // Track navigation using Next.js router events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let lastPathname = window.location.pathname
      
      // Check for pathname changes periodically (Next.js doesn't expose router events easily)
      const checkNavigation = () => {
        const currentPathname = window.location.pathname
        if (currentPathname !== lastPathname) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/layout-tracker.js:25', message: 'Navigation detected - pathname changed', data: { from: lastPathname, to: currentPathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
          // #endregion
          lastPathname = currentPathname
        }
      }
      
      // Check every 100ms for navigation
      const interval = setInterval(checkNavigation, 100)
      
      // Also listen to popstate (browser back/forward)
      window.addEventListener('popstate', () => {
        checkNavigation()
      })
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('popstate', checkNavigation)
      }
    }
  }, [])
  
  return null
}

