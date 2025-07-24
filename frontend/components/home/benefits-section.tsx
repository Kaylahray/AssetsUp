import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, GraduationCap, Rocket, Heart, Briefcase, Globe } from "lucide-react"

const audiences = [
  {
    icon: Building,
    title: "SMEs Scaling Operations",
    description:
      "Perfect for small and medium enterprises looking to professionalize their asset management as they grow.",
    benefits: ["Streamlined processes", "Cost reduction", "Compliance ready", "Scalable solution"],
  },
  {
    icon: Heart,
    title: "NGOs Managing Equipment",
    description: "Ideal for non-profit organizations managing equipment across multiple regions and projects.",
    benefits: ["Multi-location support", "Donor transparency", "Impact tracking", "Budget optimization"],
  },
  {
    icon: Rocket,
    title: "Startups with Distributed Teams",
    description: "Essential for startups managing assets across remote teams and multiple locations.",
    benefits: ["Remote asset tracking", "Team collaboration", "Growth-ready", "Cost-effective"],
  },
  {
    icon: GraduationCap,
    title: "Educational Institutions",
    description: "Comprehensive solution for schools and universities tracking devices and lab equipment.",
    benefits: ["Lab equipment tracking", "Student device loans", "Maintenance scheduling", "Budget planning"],
  },
  {
    icon: Briefcase,
    title: "Corporate Asset Management",
    description: "Enterprise-grade solution for large corporations managing assets across departments.",
    benefits: ["Department allocation", "Advanced reporting", "Compliance tools", "Integration ready"],
  },
  {
    icon: Globe,
    title: "Government Agencies",
    description: "Transparent asset oversight for government agencies requiring accountability and audit trails.",
    benefits: ["Blockchain transparency", "Audit compliance", "Public accountability", "Secure tracking"],
  },
]

export function BenefitsSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Target Audiences
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Built for every organization</h2>
          <p className="mt-4 text-lg text-gray-600">
            Whether you're a startup or an enterprise, ManageAssets adapts to your needs.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {audiences.map((audience, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <audience.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{audience.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{audience.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {audience.benefits.map((benefit, benefitIndex) => (
                        <Badge key={benefitIndex} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
