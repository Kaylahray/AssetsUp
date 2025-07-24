import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, BarChart3, QrCode, Users, Building2, Shield, Wrench, FileText, Clock } from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Asset Registration",
    description: "Complete asset lifecycle management with QR codes, receipts, and detailed tracking.",
    features: ["Asset tags & QR codes", "Receipt & manual storage", "Serial number tracking", "Category management"],
  },
  {
    icon: BarChart3,
    title: "Inventory Management",
    description: "Track consumables with quantity-based stock management and automated alerts.",
    features: ["Stock in/out history", "Low inventory alerts", "Supplier management", "Automated reordering"],
  },
  {
    icon: Users,
    title: "Assignment & Ownership",
    description: "Assign assets to employees or departments with complete usage history.",
    features: ["Employee assignments", "Department allocation", "Usage tracking", "Transfer management"],
  },
  {
    icon: Wrench,
    title: "Lifecycle & Maintenance",
    description: "Schedule maintenance, track repairs, and monitor asset depreciation.",
    features: ["Preventive maintenance", "Repair cost tracking", "Warranty management", "Depreciation reports"],
  },
  {
    icon: QrCode,
    title: "Check-in/Check-out",
    description: "QR scanning and biometric verification for temporary asset usage.",
    features: ["QR code scanning", "Biometric verification", "Overdue reminders", "Usage analytics"],
  },
  {
    icon: Shield,
    title: "Blockchain Audit Trail",
    description: "Immutable on-chain proof of asset creation, transfers, and disposal via StarkNet.",
    features: ["On-chain verification", "Tamper-proof logs", "Asset certificates", "Audit compliance"],
  },
  {
    icon: Building2,
    title: "Multi-Branch Support",
    description: "Manage assets across multiple business locations with centralized control.",
    features: ["Branch management", "Location tracking", "Per-branch reports", "Cross-branch transfers"],
  },
  {
    icon: FileText,
    title: "Advanced Reporting",
    description: "Comprehensive analytics with distribution heatmaps and performance metrics.",
    features: ["Asset distribution", "Performance analytics", "Expense tracking", "Custom reports"],
  },
  {
    icon: Clock,
    title: "Role-Based Access",
    description: "Fine-grained permissions for admins, managers, and employees.",
    features: ["User roles", "Permission management", "Department access", "Audit logs"],
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage assets
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive features designed for modern businesses, from startups to enterprises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
