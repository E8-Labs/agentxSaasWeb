// Event Debugger Utility
// Add this to your component to debug custom events

export const setupEventDebugger = () => {
  if (typeof window === 'undefined') return;

  const eventsToDebug = ['UpdateProfile', 'hidePlanBar', 'UpdateAgencyCheckList', 'UpdateCheckList'];

  eventsToDebug.forEach(eventName => {
    const originalDispatchEvent = window.dispatchEvent;
    
    window.dispatchEvent = function(event) {
      if (event.type === eventName) {
        console.log(`🎯 Event Dispatched: ${eventName}`, {
          detail: event.detail,
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
      }
      return originalDispatchEvent.call(this, event);
    };
  });

  // Listen for all custom events
  eventsToDebug.forEach(eventName => {
    window.addEventListener(eventName, (event) => {
      console.log(`👂 Event Received: ${eventName}`, {
        detail: event.detail,
        timestamp: new Date().toISOString(),
        listener: 'EventDebugger'
      });
    });
  });
};

// Usage: Call this in your component's useEffect
// useEffect(() => {
//   setupEventDebugger();
// }, []);
