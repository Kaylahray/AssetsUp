import { Injectable, Logger } from "@nestjs/common"
import * as PDFDocument from "pdfkit"
import * as ExcelJS from "exceljs"
import type { ReportsService } from "../reports.service"

export interface ReportConfig {
  title: string
  description?: string
  format: "pdf" | "excel" | "csv"
  template?: string
  filters?: Record<string, any>
  includeCharts?: boolean
  includeImages?: boolean
}

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name)

  constructor(private readonly reportsService: ReportsService) {}

  async generateAssetDistributionReport(config: ReportConfig): Promise<Buffer> {
    const data = await this.reportsService.getAssetDistributionReport()

    switch (config.format) {
      case "pdf":
        return this.generatePDFReport(data, config)
      case "excel":
        return this.generateExcelReport(data, config)
      case "csv":
        return this.generateCSVReport(data, config)
      default:
        throw new Error(`Unsupported format: ${config.format}`)
    }
  }

  async generateMaintenanceReport(config: ReportConfig, startDate?: Date, endDate?: Date): Promise<Buffer> {
    const data = await this.reportsService.getMaintenanceReport(startDate, endDate)

    switch (config.format) {
      case "pdf":
        return this.generateMaintenancePDFReport(data, config)
      case "excel":
        return this.generateMaintenanceExcelReport(data, config)
      case "csv":
        return this.generateMaintenanceCSVReport(data, config)
      default:
        throw new Error(`Unsupported format: ${config.format}`)
    }
  }

  async generateDepreciationReport(config: ReportConfig): Promise<Buffer> {
    const data = await this.reportsService.getDepreciationReport()

    switch (config.format) {
      case "pdf":
        return this.generateDepreciationPDFReport(data, config)
      case "excel":
        return this.generateDepreciationExcelReport(data, config)
      case "csv":
        return this.generateDepreciationCSVReport(data, config)
      default:
        throw new Error(`Unsupported format: ${config.format}`)
    }
  }

  async generateCustomReport(reportType: string, config: ReportConfig, filters?: any): Promise<Buffer> {
    let data: any

    switch (reportType) {
      case "executive-summary":
        data = await this.reportsService.generateExecutiveSummary()
        break
      case "inventory":
        data = await this.reportsService.getInventoryReport()
        break
      case "transfers":
        data = await this.reportsService.getTransferReport(filters?.startDate, filters?.endDate)
        break
      case "checkouts":
        data = await this.reportsService.getCheckoutReport(filters?.startDate, filters?.endDate)
        break
      case "audit":
        data = await this.reportsService.getAuditReport(filters?.startDate, filters?.endDate)
        break
      default:
        throw new Error(`Unsupported report type: ${reportType}`)
    }

    switch (config.format) {
      case "pdf":
        return this.generateGenericPDFReport(data, config, reportType)
      case "excel":
        return this.generateGenericExcelReport(data, config, reportType)
      case "csv":
        return this.generateGenericCSVReport(data, config, reportType)
      default:
        throw new Error(`Unsupported format: ${config.format}`)
    }
  }

  private async generatePDFReport(data: any, config: ReportConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument()
        const chunks: Buffer[] = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))

        // Header
        doc.fontSize(20).text(config.title, 50, 50)
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)

        let yPosition = 120

        // Asset Distribution by Category
        if (data.byCategory) {
          doc.fontSize(16).text("Assets by Category", 50, yPosition)
          yPosition += 30

          data.byCategory.forEach((item: any) => {
            doc
              .fontSize(12)
              .text(
                `${item.category}: ${item.count} assets (Value: $${Number(item.totalValue || 0).toFixed(2)})`,
                70,
                yPosition,
              )
            yPosition += 20
          })
          yPosition += 20
        }

        // Asset Distribution by Department
        if (data.byDepartment) {
          doc.fontSize(16).text("Assets by Department", 50, yPosition)
          yPosition += 30

          data.byDepartment.forEach((item: any) => {
            doc
              .fontSize(12)
              .text(
                `${item.department}: ${item.count} assets (Value: $${Number(item.totalValue || 0).toFixed(2)})`,
                70,
                yPosition,
              )
            yPosition += 20
          })
          yPosition += 20
        }

        // Asset Distribution by Status
        if (data.byStatus) {
          doc.fontSize(16).text("Assets by Status", 50, yPosition)
          yPosition += 30

          data.byStatus.forEach((item: any) => {
            doc.fontSize(12).text(`${item.status}: ${item.count} assets`, 70, yPosition)
            yPosition += 20
          })
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async generateExcelReport(data: any, config: ReportConfig): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Asset Distribution")

    // Add title
    worksheet.addRow([config.title])
    worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`])
    worksheet.addRow([])

    // Assets by Category
    if (data.byCategory) {
      worksheet.addRow(["Assets by Category"])
      worksheet.addRow(["Category", "Count", "Total Value"])

      data.byCategory.forEach((item: any) => {
        worksheet.addRow([item.category, item.count, Number(item.totalValue || 0)])
      })
      worksheet.addRow([])
    }

    // Assets by Department
    if (data.byDepartment) {
      worksheet.addRow(["Assets by Department"])
      worksheet.addRow(["Department", "Count", "Total Value"])

      data.byDepartment.forEach((item: any) => {
        worksheet.addRow([item.department, item.count, Number(item.totalValue || 0)])
      })
      worksheet.addRow([])
    }

    // Assets by Status
    if (data.byStatus) {
      worksheet.addRow(["Assets by Status"])
      worksheet.addRow(["Status", "Count"])

      data.byStatus.forEach((item: any) => {
        worksheet.addRow([item.status, item.count])
      })
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }

  private async generateCSVReport(data: any, config: ReportConfig): Promise<Buffer> {
    let csvContent = `${config.title}\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    // Assets by Category
    if (data.byCategory) {
      csvContent += "Assets by Category\n"
      csvContent += "Category,Count,Total Value\n"

      data.byCategory.forEach((item: any) => {
        csvContent += `${item.category},${item.count},${Number(item.totalValue || 0)}\n`
      })
      csvContent += "\n"
    }

    // Assets by Department
    if (data.byDepartment) {
      csvContent += "Assets by Department\n"
      csvContent += "Department,Count,Total Value\n"

      data.byDepartment.forEach((item: any) => {
        csvContent += `${item.department},${item.count},${Number(item.totalValue || 0)}\n`
      })
      csvContent += "\n"
    }

    // Assets by Status
    if (data.byStatus) {
      csvContent += "Assets by Status\n"
      csvContent += "Status,Count\n"

      data.byStatus.forEach((item: any) => {
        csvContent += `${item.status},${item.count}\n`
      })
    }

    return Buffer.from(csvContent, "utf-8")
  }

  private async generateMaintenancePDFReport(data: any, config: ReportConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument()
        const chunks: Buffer[] = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))

        // Header
        doc.fontSize(20).text(config.title, 50, 50)
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)

        let yPosition = 120

        // Summary
        if (data.costs) {
          doc.fontSize(16).text("Maintenance Summary", 50, yPosition)
          yPosition += 30

          doc.fontSize(12).text(`Total Maintenance Records: ${data.costs.count}`, 70, yPosition)
          yPosition += 20
          doc.text(`Total Cost: $${Number(data.costs.totalCost || 0).toFixed(2)}`, 70, yPosition)
          yPosition += 20
          doc.text(`Average Cost: $${Number(data.costs.averageCost || 0).toFixed(2)}`, 70, yPosition)
          yPosition += 40
        }

        // Upcoming Maintenance
        if (data.upcoming && data.upcoming.length > 0) {
          doc.fontSize(16).text("Upcoming Maintenance", 50, yPosition)
          yPosition += 30

          data.upcoming.slice(0, 10).forEach((item: any) => {
            doc
              .fontSize(10)
              .text(
                `${item.asset?.name || "Unknown"} - ${item.maintenanceType} - ${new Date(item.date).toLocaleDateString()}`,
                70,
                yPosition,
              )
            yPosition += 15
          })
          yPosition += 20
        }

        // Overdue Maintenance
        if (data.overdue && data.overdue.length > 0) {
          doc.fontSize(16).text("Overdue Maintenance", 50, yPosition)
          yPosition += 30

          data.overdue.slice(0, 10).forEach((item: any) => {
            doc
              .fontSize(10)
              .text(
                `${item.asset?.name || "Unknown"} - ${item.maintenanceType} - ${new Date(item.date).toLocaleDateString()}`,
                70,
                yPosition,
              )
            yPosition += 15
          })
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async generateMaintenanceExcelReport(data: any, config: ReportConfig): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Maintenance Report")

    // Add title
    worksheet.addRow([config.title])
    worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`])
    worksheet.addRow([])

    // Summary
    if (data.costs) {
      worksheet.addRow(["Maintenance Summary"])
      worksheet.addRow(["Total Records", data.costs.count])
      worksheet.addRow(["Total Cost", Number(data.costs.totalCost || 0)])
      worksheet.addRow(["Average Cost", Number(data.costs.averageCost || 0)])
      worksheet.addRow([])
    }

    // Upcoming Maintenance
    if (data.upcoming && data.upcoming.length > 0) {
      worksheet.addRow(["Upcoming Maintenance"])
      worksheet.addRow(["Asset", "Type", "Date", "Status"])

      data.upcoming.forEach((item: any) => {
        worksheet.addRow([item.asset?.name || "Unknown", item.maintenanceType, item.date, item.status])
      })
      worksheet.addRow([])
    }

    // Overdue Maintenance
    if (data.overdue && data.overdue.length > 0) {
      worksheet.addRow(["Overdue Maintenance"])
      worksheet.addRow(["Asset", "Type", "Date", "Status"])

      data.overdue.forEach((item: any) => {
        worksheet.addRow([item.asset?.name || "Unknown", item.maintenanceType, item.date, item.status])
      })
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }

  private async generateMaintenanceCSVReport(data: any, config: ReportConfig): Promise<Buffer> {
    let csvContent = `${config.title}\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    // Summary
    if (data.costs) {
      csvContent += "Maintenance Summary\n"
      csvContent += `Total Records,${data.costs.count}\n`
      csvContent += `Total Cost,${Number(data.costs.totalCost || 0)}\n`
      csvContent += `Average Cost,${Number(data.costs.averageCost || 0)}\n\n`
    }

    // Upcoming Maintenance
    if (data.upcoming && data.upcoming.length > 0) {
      csvContent += "Upcoming Maintenance\n"
      csvContent += "Asset,Type,Date,Status\n"

      data.upcoming.forEach((item: any) => {
        csvContent += `${item.asset?.name || "Unknown"},${item.maintenanceType},${item.date},${item.status}\n`
      })
      csvContent += "\n"
    }

    // Overdue Maintenance
    if (data.overdue && data.overdue.length > 0) {
      csvContent += "Overdue Maintenance\n"
      csvContent += "Asset,Type,Date,Status\n"

      data.overdue.forEach((item: any) => {
        csvContent += `${item.asset?.name || "Unknown"},${item.maintenanceType},${item.date},${item.status}\n`
      })
    }

    return Buffer.from(csvContent, "utf-8")
  }

  private async generateDepreciationPDFReport(data: any, config: ReportConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument()
        const chunks: Buffer[] = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))

        // Header
        doc.fontSize(20).text(config.title, 50, 50)
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)

        let yPosition = 120

        // Summary
        if (data.summary) {
          doc.fontSize(16).text("Depreciation Summary", 50, yPosition)
          yPosition += 30

          doc.fontSize(12).text(`Total Original Value: $${data.summary.totalOriginalValue.toFixed(2)}`, 70, yPosition)
          yPosition += 20
          doc.text(`Total Current Value: $${data.summary.totalCurrentValue.toFixed(2)}`, 70, yPosition)
          yPosition += 20
          doc.text(`Total Depreciation: $${data.summary.totalDepreciation.toFixed(2)}`, 70, yPosition)
          yPosition += 20
          doc.text(`Average Depreciation: ${data.summary.averageDepreciationPercentage.toFixed(2)}%`, 70, yPosition)
          yPosition += 40
        }

        // Top Depreciated Assets
        if (data.assets && data.assets.length > 0) {
          doc.fontSize(16).text("Top Depreciated Assets", 50, yPosition)
          yPosition += 30

          data.assets.slice(0, 15).forEach((asset: any) => {
            doc
              .fontSize(10)
              .text(
                `${asset.assetName} - Original: $${asset.purchasePrice.toFixed(2)} - Current: $${asset.currentValue.toFixed(2)} - Depreciated: $${asset.depreciatedAmount.toFixed(2)}`,
                70,
                yPosition,
              )
            yPosition += 15
          })
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async generateDepreciationExcelReport(data: any, config: ReportConfig): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Depreciation Report")

    // Add title
    worksheet.addRow([config.title])
    worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`])
    worksheet.addRow([])

    // Summary
    if (data.summary) {
      worksheet.addRow(["Depreciation Summary"])
      worksheet.addRow(["Total Original Value", data.summary.totalOriginalValue])
      worksheet.addRow(["Total Current Value", data.summary.totalCurrentValue])
      worksheet.addRow(["Total Depreciation", data.summary.totalDepreciation])
      worksheet.addRow(["Average Depreciation %", data.summary.averageDepreciationPercentage])
      worksheet.addRow([])
    }

    // Assets
    if (data.assets && data.assets.length > 0) {
      worksheet.addRow(["Asset Details"])
      worksheet.addRow([
        "Asset Name",
        "Asset Tag",
        "Category",
        "Purchase Price",
        "Current Value",
        "Depreciated Amount",
        "Age (Years)",
        "Branch",
        "Department",
      ])

      data.assets.forEach((asset: any) => {
        worksheet.addRow([
          asset.assetName,
          asset.assetTag,
          asset.category,
          asset.purchasePrice,
          asset.currentValue,
          asset.depreciatedAmount,
          asset.ageInYears,
          asset.branch,
          asset.department,
        ])
      })
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }

  private async generateDepreciationCSVReport(data: any, config: ReportConfig): Promise<Buffer> {
    let csvContent = `${config.title}\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    // Summary
    if (data.summary) {
      csvContent += "Depreciation Summary\n"
      csvContent += `Total Original Value,${data.summary.totalOriginalValue}\n`
      csvContent += `Total Current Value,${data.summary.totalCurrentValue}\n`
      csvContent += `Total Depreciation,${data.summary.totalDepreciation}\n`
      csvContent += `Average Depreciation %,${data.summary.averageDepreciationPercentage}\n\n`
    }

    // Assets
    if (data.assets && data.assets.length > 0) {
      csvContent += "Asset Details\n"
      csvContent +=
        "Asset Name,Asset Tag,Category,Purchase Price,Current Value,Depreciated Amount,Age (Years),Branch,Department\n"

      data.assets.forEach((asset: any) => {
        csvContent += `${asset.assetName},${asset.assetTag},${asset.category},${asset.purchasePrice},${asset.currentValue},${asset.depreciatedAmount},${asset.ageInYears},${asset.branch},${asset.department}\n`
      })
    }

    return Buffer.from(csvContent, "utf-8")
  }

  private async generateGenericPDFReport(data: any, config: ReportConfig, reportType: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument()
        const chunks: Buffer[] = []

        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))

        // Header
        doc.fontSize(20).text(config.title, 50, 50)
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)

        const yPosition = 120

        // Add content based on report type
        doc.fontSize(12).text(JSON.stringify(data, null, 2), 50, yPosition)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async generateGenericExcelReport(data: any, config: ReportConfig, reportType: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(reportType)

    // Add title
    worksheet.addRow([config.title])
    worksheet.addRow([`Generated on: ${new Date().toLocaleDateString()}`])
    worksheet.addRow([])

    // Add data (simplified for generic reports)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        worksheet.addRow([JSON.stringify(item)])
      })
    } else {
      worksheet.addRow([JSON.stringify(data)])
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }

  private async generateGenericCSVReport(data: any, config: ReportConfig, reportType: string): Promise<Buffer> {
    let csvContent = `${config.title}\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    // Add data (simplified for generic reports)
    csvContent += JSON.stringify(data, null, 2)

    return Buffer.from(csvContent, "utf-8")
  }
}
