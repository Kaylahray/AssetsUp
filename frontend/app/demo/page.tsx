import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, ExternalLink } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Experience ManageAssets</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore our comprehensive asset management platform through interactive demos and live examples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Interactive Demo</CardTitle>
                <Badge variant="secondary">Live</Badge>
              </div>
              <CardDescription>Try our full-featured demo environment with sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Launch Demo
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Video Walkthrough</CardTitle>
                <Badge variant="outline">5 min</Badge>
              </div>
              <CardDescription>Watch a guided tour of all major features and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              <Button variant="outline" className="w-full">
                Watch Video
                <Play className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Asset registration and tracking</li>
                <li>• QR code generation</li>
                <li>• Assignment workflows</li>
                <li>• Maintenance scheduling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Control</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Stock level monitoring</li>
                <li>• Automated alerts</li>
                <li>• Transaction history</li>
                <li>• Supplier management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Blockchain Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• StarkNet integration</li>
                <li>• Immutable audit trails</li>
                <li>• Asset certificates</li>
                <li>• Verification tools</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
