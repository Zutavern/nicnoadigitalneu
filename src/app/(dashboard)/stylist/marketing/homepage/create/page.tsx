'use client'

import { WizardContainer } from '@/components/homepage-builder/wizard'

export default function CreateHomepagePage() {
  return (
    <div className="p-6">
      <WizardContainer 
        userRole="STYLIST"
        basePath="/stylist/marketing/homepage"
      />
    </div>
  )
}



