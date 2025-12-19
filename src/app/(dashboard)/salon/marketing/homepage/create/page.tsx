'use client'

import { WizardContainer } from '@/components/homepage-builder/wizard'

export default function CreateSalonHomepagePage() {
  return (
    <div className="p-6">
      <WizardContainer 
        userRole="SALON_OWNER"
        basePath="/salon/marketing/homepage"
      />
    </div>
  )
}



