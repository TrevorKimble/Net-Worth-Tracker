import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Net Worth Tracker</h1>
          <p className="text-gray-600 mt-2">Track your financial progress with detailed asset monitoring</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Personal Portfolio
              </CardTitle>
              <CardDescription>Track your personal assets with live prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">$0.00</div>
              <p className="text-sm text-gray-600 mb-4">No assets added yet</p>
              <Link href="/personal">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Personal Assets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Solo 401k Trust
              </CardTitle>
              <CardDescription>Track your Solo 401k investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">$0.00</div>
              <p className="text-sm text-gray-600 mb-4">No assets added yet</p>
              <Link href="/solo401k">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Solo 401k Assets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Monthly Input
              </CardTitle>
              <CardDescription>Quick monthly estimates for cash, stocks, crypto, gold, silver</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/monthly">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Monthly Estimate
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Activity Log
              </CardTitle>
              <CardDescription>View detailed transaction history and price updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/logs">
                <Button className="w-full" variant="outline">
                  View Activity Log
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What you can do with this net worth tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Monthly Tracking</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Quick monthly estimates for all asset types</li>
                  <li>• Notes field for additional context</li>
                  <li>• Historical monthly data tracking</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Detailed Asset Tracking</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live price updates every 10 seconds</li>
                  <li>• Specific stock/crypto/precious metal tracking</li>
                  <li>• Separate Personal and Solo 401k portfolios</li>
                  <li>• Detailed transaction logging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}