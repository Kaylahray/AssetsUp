import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ScheduledReport } from "../entities/scheduled-report.entity"
import type { ReportGeneratorService } from "./report-generator.service"
import type { NotificationsService } from "../../notifications/notifications.service"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    @InjectRepository(ScheduledReport)
    private scheduledReportRepository: Repository<ScheduledReport>,
    private reportGeneratorService: ReportGeneratorService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports() {
    this.logger.log("Processing scheduled reports...")

    const now = new Date()
    const scheduledReports = await this.scheduledReportRepository.find({
      where: {
        isActive: true,
        nextRunDate: now,
      },
      relations: ["user"],
    })

    for (const scheduledReport of scheduledReports) {
      try {
        await this.generateAndSendReport(scheduledReport)
        await this.updateNextRunDate(scheduledReport)
      } catch (error) {
        this.logger.error(`Failed to generate scheduled report ${scheduledReport.id}: ${error.message}`)
      }
    }
  }

  async createScheduledReport(
    userId: string,
    reportType: string,
    schedule: string,
    config: any,
    recipients: string[],
  ): Promise<ScheduledReport> {
    const scheduledReport = this.scheduledReportRepository.create({
      userId,
      reportType,
      schedule,
      config,
      recipients,
      nextRunDate: this.calculateNextRunDate(schedule),
      isActive: true,
    })

    return this.scheduledReportRepository.save(scheduledReport)
  }

  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    await this.scheduledReportRepository.update(id, updates)
    return this.scheduledReportRepository.findOne({ where: { id } })
  }

  async deleteScheduledReport(id: string): Promise<void> {
    await this.scheduledReportRepository.delete(id)
  }

  async getScheduledReports(userId?: string): Promise<ScheduledReport[]> {
    const query = this.scheduledReportRepository.createQueryBuilder("report").leftJoinAndSelect("report.user", "user")

    if (userId) {
      query.where("report.userId = :userId", { userId })
    }

    return query.getMany()
  }

  private async generateAndSendReport(scheduledReport: ScheduledReport): Promise<void> {
    try {
      let reportBuffer: Buffer

      switch (scheduledReport.reportType) {
        case "asset-distribution":
          reportBuffer = await this.reportGeneratorService.generateAssetDistributionReport(scheduledReport.config)
          break
        case "maintenance":
          reportBuffer = await this.reportGeneratorService.generateMaintenanceReport(
            scheduledReport.config,
            scheduledReport.config.startDate,
            scheduledReport.config.endDate,
          )
          break
        case "depreciation":
          reportBuffer = await this.reportGeneratorService.generateDepreciationReport(scheduledReport.config)
          break
        default:
          reportBuffer = await this.reportGeneratorService.generateCustomReport(
            scheduledReport.reportType,
            scheduledReport.config,
            scheduledReport.config.filters,
          )
      }

      // Save report to file system
      const reportsDir = path.join(process.cwd(), "uploads", "reports")
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true })
      }

      const fileName = `${scheduledReport.reportType}-${Date.now()}.${scheduledReport.config.format}`
      const filePath = path.join(reportsDir, fileName)
      fs.writeFileSync(filePath, reportBuffer)

      // Send notifications to recipients
      for (const recipient of scheduledReport.recipients) {
        await this.notificationsService.createNotification({
          userId: recipient,
          title: `Scheduled Report: ${scheduledReport.config.title}`,
          message: `Your scheduled ${scheduledReport.reportType} report has been generated.`,
          type: "info",
          data: {
            reportId: scheduledReport.id,
            fileName,
            filePath,
          },
        })
      }

      // Update last run date
      scheduledReport.lastRunDate = new Date()
      await this.scheduledReportRepository.save(scheduledReport)

      this.logger.log(`Successfully generated scheduled report ${scheduledReport.id}`)
    } catch (error) {
      this.logger.error(`Failed to generate scheduled report ${scheduledReport.id}: ${error.message}`)
      throw error
    }
  }

  private async updateNextRunDate(scheduledReport: ScheduledReport): Promise<void> {
    scheduledReport.nextRunDate = this.calculateNextRunDate(scheduledReport.schedule)
    await this.scheduledReportRepository.save(scheduledReport)
  }

  private calculateNextRunDate(schedule: string): Date {
    const now = new Date()

    switch (schedule) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case "monthly":
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      case "quarterly":
        const nextQuarter = new Date(now)
        nextQuarter.setMonth(nextQuarter.getMonth() + 3)
        return nextQuarter
      case "yearly":
        const nextYear = new Date(now)
        nextYear.setFullYear(nextYear.getFullYear() + 1)
        return nextYear
      default:
        // Custom cron expression
        return new Date(now.getTime() + 24 * 60 * 60 * 1000) // Default to daily
    }
  }
}
