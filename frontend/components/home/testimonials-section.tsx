import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    content:
      "ManageAssets transformed how we track our equipment across 15 locations. The blockchain audit trail gives us complete transparency for our donors.",
    author: "Sarah Johnson",
    role: "Operations Director",
    company: "Global Health Initiative",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    rating: 5,
  },
  {
    content:
      "The QR code system and mobile app made asset check-in/check-out seamless for our distributed team. We've reduced asset loss by 80%.",
    author: "Michael Chen",
    role: "IT Manager",
    company: "TechStart Inc.",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
    rating: 5,
  },
  {
    content:
      "Finally, a solution that scales with our growth. From 50 assets to 5,000+ assets across multiple departments - ManageAssets handles it all.",
    author: "Emily Rodriguez",
    role: "Facilities Manager",
    company: "EduTech University",
    avatar: "/placeholder.svg?height=40&width=40&text=ER",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What our customers say</h2>
          <p className="mt-4 text-lg text-gray-600">
            See how organizations are transforming their asset management with ManageAssets.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-900 mb-6">"{testimonial.content}"</blockquote>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                    <AvatarFallback>
                      {testimonial.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.company}
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
