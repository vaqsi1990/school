// Visitor tracking utility
export const trackVisitor = async (page?: string) => {
  try {
    // Get visitor information
    const visitorData = {
      page: page || window.location.pathname,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      sessionId: getSessionId()
    }

    // Send to API
    await fetch('/api/admin/statistics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitorData)
    })
  } catch (error) {
    console.error('Error tracking visitor:', error)
  }
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('visitor_session_id', sessionId)
  }
  return sessionId
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

// Track page views automatically
export const initVisitorTracking = () => {
  // Track initial page load
  trackVisitor()

  // Track page changes (for SPA navigation)
  let currentPath = window.location.pathname
  
  const checkPathChange = () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname
      trackVisitor()
    }
  }

  // Check for path changes every 100ms
  setInterval(checkPathChange, 100)
}
