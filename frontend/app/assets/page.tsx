import { Plus, Search, Filter, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const assets = [
  {
    id: "1",
    name: "Laptop",
    model: "MacBook Pro",
    serialNumber: "C02X1234ABCD",
    condition: "Good",
    assignedTo: { id: "user1", name: "John Doe" },
  },
  {
    id: "2",
    name: "Monitor",
    model: "Dell UltraSharp",
    serialNumber: "CN0123456789",
    condition: "Excellent",
    assignedTo: null,
  },
  {
    id: "3",
    name: "Keyboard",
    model: "Logitech MX Keys",
    serialNumber: "2345678901",
    condition: "Fair",
    assignedTo: { id: "user2", name: "Jane Smith" },
  },
]

const Page = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <Link href="/assets/batch-assign">
              <Users className="mr-2 h-4 w-4" />
              Batch Assign
            </Link>
          </Button>
          <Button asChild>
            <Link href="/assets/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Input type="text" placeholder="Search assets..." className="max-w-md" />
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Condition: Good</DropdownMenuItem>
            <DropdownMenuItem>Condition: Fair</DropdownMenuItem>
            <DropdownMenuItem>Condition: Damaged</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Assigned</DropdownMenuItem>
            <DropdownMenuItem>Unassigned</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableCaption>A list of your recent assets.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.id}</TableCell>
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.model}</TableCell>
              <TableCell>{asset.serialNumber}</TableCell>
              <TableCell>{asset.condition}</TableCell>
              <TableCell>
                {asset.assignedTo ? (
                  <Link href={`/users/${asset.assignedTo.id}/assets`} className="text-blue-600 hover:underline">
                    {asset.assignedTo.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Page
