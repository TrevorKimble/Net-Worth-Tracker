'use client'

import { MainLayout } from '@/components/main-layout'
import { ActivityLogTable } from "@/components/ActivityLogTable"

export default function LogsPage() {
  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-2">Complete database change history with before/after values</p>
        </div>

        {/* Activity Log Table with Server-Side Pagination */}
        <ActivityLogTable />
      </div>
    </MainLayout>
  )
}
