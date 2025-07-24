import Link from "next/link"
import {
  Box,
  Hash,
  Code,
  Key,
  FileCode,
  FileJson,
  Blocks,
  Lock,
  FileText,
  Monitor,
  Activity,
  Code2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tools = [
  {
    name: "Box Shadow Generator",
    description: "Create and customize CSS box shadows with live preview",
    icon: Box,
    path: "/tools/box-shadow",
    category: "frontend",
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and other hash formats",
    icon: Hash,
    path: "/tools/hash-generator",
    category: "frontend",
  },
  {
    name: "Regex Tester",
    description: "Test and debug regular expressions with real-time feedback",
    icon: Code,
    path: "/tools/regex-tester",
    category: "frontend",
  },
  {
    name: "JWT Decoder",
    description: "Decode and verify JSON Web Tokens",
    icon: Key,
    path: "/tools/jwt-decoder",
    category: "frontend",
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Encode or decode Base64 strings and files",
    icon: FileCode,
    path: "/tools/base64",
    category: "frontend",
  },
  {
    name: "JSON Formatter & Validator",
    description: "Format, validate, and beautify JSON data",
    icon: FileJson,
    path: "/tools/json-formatter",
    category: "frontend",
  },
  {
    name: "Contract Address Shortener",
    description: "Create shortened versions of blockchain addresses",
    icon: Hash,
    path: "/tools/address-shortener",
    category: "web3",
    backend: true,
  },
  {
    name: "StarkNet Contract Reader",
    description: "Read and interact with StarkNet smart contracts",
    icon: Blocks,
    path: "/tools/starknet-reader",
    category: "web3",
    backend: true,
    starknet: true,
  },
  {
    name: "Web Screenshot Tool",
    description: "Capture screenshots of any website with customizable options",
    icon: Monitor,
    path: "/tools/web-screenshot",
    category: "utility",
    backend: true,
  },
  {
    name: "PDF Generator",
    description: "Create customized PDF documents with various content types",
    icon: FileText,
    path: "/tools/pdf-generator",
    category: "utility",
    backend: true,
  },
  {
    name: "Ping & Uptime Monitor",
    description: "Monitor website uptime and get notified when services go down",
    icon: Activity,
    path: "/tools/uptime-monitor",
    category: "utility",
    backend: true,
  },
  {
    name: "Code Snippet Saver",
    description: "Save, organize, and manage your code snippets with syntax highlighting",
    icon: Code2,
    path: "/tools/code-snippets",
    category: "utility",
    backend: true,
  },
]

export default function ToolsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Explore Tools</h1>
        <p className="text-muted-foreground">Browse our collection of developer tools. Sign in to use them.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.path} href={tool.path} className="group">
            <Card className="h-full overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="relative pb-2">
                <div className="absolute right-4 top-4">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <tool.icon className="h-6 w-6" />
                </div>
                <CardTitle className="mt-2">{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {tool.category}
                  </Badge>
                  {tool.backend && <Badge variant="outline">Backend</Badge>}
                  {tool.starknet && <Badge className="bg-purple-600 hover:bg-purple-700">StarkNet</Badge>}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">Login required to use this tool</div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
