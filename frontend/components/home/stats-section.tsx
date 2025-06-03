import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { value: "99.9%", label: "Uptime Guarantee", description: "Reliable asset tracking" },
  { value: "50+", label: "Asset Categories", description: "Comprehensive coverage" },
  { value: "24/7", label: "Support Available", description: "Always here to help" },
  { value: "100%", label: "Blockchain Verified", description: "Immutable audit trails" },
]

export function StatsSection() {
  return (
    <section className="py-24 sm:py-32 bg-blue-600">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by organizations worldwide
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of organizations already using ManageAssets to streamline their operations.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-lg font-medium text-blue-100">{stat.label}</div>
                <div className="mt-1 text-sm text-blue-200">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
