import React from 'react'

function MyAgentXLoader() {
  return (
    <div
      role="status"
      aria-label="Loading agents"
      style={{
        width: '100%',
        // minWidth: 500,
        maxWidth: 1028,
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 500,
          color: '#6b7280',
        }}
      >
        Loading agents…
      </p>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: 120,
              borderRadius: 8,
              backgroundColor: '#d1d5db',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default MyAgentXLoader
