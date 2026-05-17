/**
 * useDeviceCapabilities Hook
 * Detects device type and GPU capabilities for quality optimization
 */

import { useEffect, useState } from 'react'
import type { DeviceCapabilities } from '@/types/premium-components'

/**
 * Check if WebGL is supported
 */
function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch (e) {
    return false
  }
}

/**
 * Detect device type based on screen width and user agent
 */
function detectDeviceType(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
} {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true }
  }

  const width = window.innerWidth
  const userAgent = navigator.userAgent.toLowerCase()
  
  const isMobileUA = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTabletUA = /tablet|ipad|playbook|silk/i.test(userAgent)

  // Determine device type
  const isMobile = width < 640 || (isMobileUA && !isTabletUA)
  const isTablet = (width >= 640 && width < 1024) || isTabletUA
  const isDesktop = width >= 1024 && !isMobileUA && !isTabletUA

  return { isMobile, isTablet, isDesktop }
}

/**
 * Estimate GPU tier based on device and WebGL capabilities
 */
function estimateGPUTier(
  hasWebGL: boolean,
  isMobile: boolean,
  isTablet: boolean
): 'low' | 'medium' | 'high' {
  if (!hasWebGL) return 'low'
  if (isMobile) return 'low'
  if (isTablet) return 'medium'
  
  // Desktop - check for additional indicators
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
        
        // High-end GPUs
        if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon')) {
          return 'high'
        }
        
        // Integrated GPUs
        if (renderer.includes('intel')) {
          return 'medium'
        }
      }
    }
  } catch (e) {
    // Fallback to medium for desktop
    return 'medium'
  }

  return 'high' // Default for desktop
}

/**
 * Get recommended quality based on device capabilities
 */
function getRecommendedQuality(
  gpuTier: 'low' | 'medium' | 'high',
  isMobile: boolean
): 'low' | 'medium' | 'high' {
  if (isMobile) return 'low'
  if (gpuTier === 'low') return 'low'
  if (gpuTier === 'medium') return 'medium'
  return 'high'
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasWebGL: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    gpuTier: 'medium',
    recommendedQuality: 'medium',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasWebGL = hasWebGLSupport()
    const { isMobile, isTablet, isDesktop } = detectDeviceType()
    const gpuTier = estimateGPUTier(hasWebGL, isMobile, isTablet)
    const recommendedQuality = getRecommendedQuality(gpuTier, isMobile)

    setCapabilities({
      hasWebGL,
      isMobile,
      isTablet,
      isDesktop,
      gpuTier,
      recommendedQuality,
    })

    // Re-check on window resize
    const handleResize = () => {
      const deviceType = detectDeviceType()
      const newGpuTier = estimateGPUTier(hasWebGL, deviceType.isMobile, deviceType.isTablet)
      const newQuality = getRecommendedQuality(newGpuTier, deviceType.isMobile)

      setCapabilities({
        hasWebGL,
        ...deviceType,
        gpuTier: newGpuTier,
        recommendedQuality: newQuality,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return capabilities
}
