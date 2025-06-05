import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1">
            <Shield className="mr-2 h-3 w-3" />
            Powered by StarkNet Blockchain
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Unified Asset Management with <span className="text-blue-600">Blockchain Transparency</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Track, monitor, and manage your physical and digital assets across departments and branches with immutable
            on-chain transparency via StarkNet for critical events.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4">
            <img
              src="/placeholder.svg?height=600&width=1200&text=ManageAssets Dashboard Preview"
              alt="ManageAssets Dashboard"
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
              width={1200}
              height={600}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
