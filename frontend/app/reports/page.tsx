"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssetDistributionChart } from "@/components/reports/asset-distribution-chart"
import { DepreciationReport } from "@/components/reports/depreciation-report"
import { ExecutiveSummary } from "@/components/reports/executive-summary"
import { BranchReport } from "@/components/reports/branch-report"
import { AssetHeatmap } from "@/components/reports/asset-heatmap"
import { DowntimePerformance } from "@/components/reports/downtime-performance"
import { ExpenseMaintenanceTrends } from "@/components/reports/expense-maintenance-trends"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your asset management</p>
      </div>

      <div className="mb-8">
        <ExecutiveSummary />
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="distribution">Asset Distribution</TabsTrigger>
          <TabsTrigger value="heatmap">Distribution Heatmap</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="downtime">Downtime vs Performance</TabsTrigger>
          <TabsTrigger value="expenses">Expense Trends</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <AssetDistributionChart />
        </TabsContent>

        <TabsContent value="heatmap">
          <AssetHeatmap />
        </TabsContent>

        <TabsContent value="depreciation">
          <DepreciationReport />
        </TabsContent>

        <TabsContent value="downtime">
          <DowntimePerformance />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseMaintenanceTrends />
        </TabsContent>

        <TabsContent value="branches">
          <BranchReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
