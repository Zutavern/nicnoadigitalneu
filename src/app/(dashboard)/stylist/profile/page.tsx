'use client'

import { UserProfileForm } from '@/components/profile/user-profile-form'

export default function StylistProfilePage() {
  return (
    <UserProfileForm 
      accentColor="pink"
      showSocialMedia={true}
      backUrl="/stylist"
    />
  )
}
