'use client'

import { UserProfileForm } from '@/components/profile/user-profile-form'

export default function SalonProfilePage() {
  return (
    <UserProfileForm 
      accentColor="blue"
      showSocialMedia={false}
      backUrl="/salon"
    />
  )
}
