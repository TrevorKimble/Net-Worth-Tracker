'use client'

import { MainLayout } from '@/components/main-layout'
import { ActivityLogTable } from "@/components/ActivityLogTable"

export default function LogsPage() {
  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <ActivityLogTable />
      </div>
    </MainLayout>
  )
}
