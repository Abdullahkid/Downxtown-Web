/**
 * User domain types — mirrors Android Kotlin data classes exactly.
 * Requirements: 11.1
 */

export type AccountType = 'PERSONAL' | 'BUSINESS'

export interface Address {
  id: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  placeId?: string
  formattedAddress?: string
  location?: { lat: number; lng: number }
}

export interface Personal {
  id: string
  firebaseUid: string
  name: string
  username: string
  email: string
  phoneNumber?: string
  profileImageId?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  dateOfBirth?: string
  address?: Address
  accountType: AccountType
  followingCount: number
  purchaseCount: number
  wishlistCount: number
  cartCount: number
  fcmToken?: string
}
