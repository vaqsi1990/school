'use client'

import { useEffect } from 'react'
import { initVisitorTracking } from '@/utils/visitorTracking'

const VisitorTracker = () => {
  useEffect(() => {
    initVisitorTracking()
  }, [])

  return null
}

export default VisitorTracker
