/**
 * Globe Markers Data
 * Seller locations across major Indian cities
 */

import type { GlobeMarker } from '@/types/premium-components'

export const indiaSellerLocations: GlobeMarker[] = [
  {
    id: 'lucknow',
    location: [26.8467, 80.9462],
    size: 0.08,
    color: '#00FFFF',
    label: 'Lucknow - 1,200+ sellers'
  },
  {
    id: 'mumbai',
    location: [19.0760, 72.8777],
    size: 0.06,
    color: '#00FFFF',
    label: 'Mumbai - 2,500+ sellers'
  },
  {
    id: 'bangalore',
    location: [12.9716, 77.5946],
    size: 0.06,
    color: '#00FFFF',
    label: 'Bangalore - 2,100+ sellers'
  },
  {
    id: 'hyderabad',
    location: [17.3850, 78.4867],
    size: 0.05,
    color: '#00FFFF',
    label: 'Hyderabad - 1,500+ sellers'
  },
  {
    id: 'chennai',
    location: [13.0827, 80.2707],
    size: 0.05,
    color: '#00FFFF',
    label: 'Chennai - 1,400+ sellers'
  },
  {
    id: 'kolkata',
    location: [22.5726, 88.3639],
    size: 0.05,
    color: '#00FFFF',
    label: 'Kolkata - 1,200+ sellers'
  },
  {
    id: 'pune',
    location: [18.5204, 73.8567],
    size: 0.04,
    color: '#00FFFF',
    label: 'Pune - 900+ sellers'
  },
  {
    id: 'ahmedabad',
    location: [23.0225, 72.5714],
    size: 0.04,
    color: '#00FFFF',
    label: 'Ahmedabad - 850+ sellers'
  },
  {
    id: 'jaipur',
    location: [26.9124, 75.7873],
    size: 0.04,
    color: '#00FFFF',
    label: 'Jaipur - 700+ sellers'
  },
  {
    id: 'surat',
    location: [21.1702, 72.8311],
    size: 0.04,
    color: '#00FFFF',
    label: 'Surat - 650+ sellers'
  },
]

/**
 * Get markers based on device capabilities
 * Reduce marker count on mobile for performance
 */
export function getMarkersForDevice(isMobile: boolean, isTablet: boolean): GlobeMarker[] {
  if (isMobile) {
    // Show only top 5 cities on mobile
    return indiaSellerLocations.slice(0, 5)
  }
  
  if (isTablet) {
    // Show top 7 cities on tablet
    return indiaSellerLocations.slice(0, 7)
  }
  
  // Show all cities on desktop
  return indiaSellerLocations
}

