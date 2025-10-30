'use client'

import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ActivityLogTable } from "@/components/ActivityLogTable"

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            Activity Log
          </h1>
          <p className="text-gray-600 mt-2">Complete database change history with before/after values</p>
        </div>

        {/* Activity Log Table with Server-Side Pagination */}
        <ActivityLogTable />
      </div>
    </div>
  )
}
