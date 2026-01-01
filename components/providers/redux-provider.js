'use client'

import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { persistor, store } from '../../store'

export function ReduxProvider({ children }) {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())
  renderCount.current += 1
  
  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/redux-provider.js:12', message: 'ReduxProvider mounted', data: { pathname: window.location.pathname, mountTime: mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
    }
  }, [])
  
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'providers/redux-provider.js:18', message: 'ReduxProvider render', data: { renderCount: renderCount.current, pathname: window.location.pathname, timeSinceMount: Date.now() - mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run3', hypothesisId: 'I' }) }).catch(() => { });
  }
  // #endregion
  
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  )
}
