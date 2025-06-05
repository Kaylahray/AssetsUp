import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your asset management?
          </h2>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Join thousands of organizations using ManageAssets to streamline operations, reduce costs, and ensure
            compliance with blockchain-verified audit trails.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" variant="secondary" className="px-8">
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/contact" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Enterprise Demo
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-200">No credit card required • 30-day free trial • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
