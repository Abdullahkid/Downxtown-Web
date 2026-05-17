// Premium Components Type Definitions

// Globe3D Component Types
export interface GlobeMarker {
  id: string
  location: [number, number] // [latitude, longitude]
  size: number
  color?: string
  label?: string
}

export interface Globe3DProps {
  markers?: GlobeMarker[]
  autoRotate?: boolean
  rotationSpeed?: number
  theme?: 'light' | 'dark'
  className?: string
  onMarkerClick?: (marker: GlobeMarker) => void
}

// HamburgerMenuOverlay Component Types
export interface MenuItem {
  name: string
  href: string
  icon?: React.ReactNode
}

export interface HamburgerMenuOverlayProps {
  isOpen: boolean
  onClose: () => void
  menuItems: MenuItem[]
  ctaButton?: {
    label: string
    onClick: () => void
  }
}

// AuroraText Component Types
export interface AuroraTextProps {
  children: React.ReactNode
  colors?: string[]
  animationDuration?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

// AnimatedWave Component Types
export interface AnimatedWaveProps {
  quality?: 'low' | 'medium' | 'high' | 'auto'
  colors?: {
    primary: string
    secondary: string
  }
  amplitude?: number
  frequency?: number
  speed?: number
  className?: string
}

// SlidingCards Component Types
export interface CardData {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  metric: string
  background?: string
}

export interface SlidingCardsProps {
  cards: CardData[]
  onCardDismiss?: (card: CardData) => void
  onCardView?: (card: CardData) => void
  className?: string
}

// Analytics Event Types
export interface PremiumComponentEvent {
  component: 'globe' | 'wave' | 'aurora' | 'sliding-cards' | 'hamburger-menu'
  action: 'view' | 'interact' | 'dismiss' | 'error'
  label?: string
  value?: number
  metadata?: Record<string, any>
}

// Device Capabilities Types
export interface DeviceCapabilities {
  hasWebGL: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  gpuTier: 'low' | 'medium' | 'high'
  recommendedQuality: 'low' | 'medium' | 'high'
}
