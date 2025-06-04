import { Injectable } from "@nestjs/common"
import type { MailerService } from "@nestjs-modules/mailer"
import type { Maintenance } from "../maintenance/entities/maintenance.entity"

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUpcomingMaintenanceNotification(maintenance: Maintenance): Promise<void> {
    if (!maintenance.responsiblePerson?.email) {
      return
    }

    const subject = `Upcoming Maintenance: ${maintenance.asset.name}`
    const template = "upcoming-maintenance"
    const context = {
      maintenanceName: maintenance.description,
      assetName: maintenance.asset.name,
      dueDate: maintenance.dueDate.toLocaleDateString(),
      type: maintenance.type,
      responsiblePerson: maintenance.responsiblePerson.name,
    }

    await this.sendEmail(maintenance.responsiblePerson.email, subject, template, context)
  }

  async sendMaintenanceOverdueNotification(maintenance: Maintenance): Promise<void> {
    if (!maintenance.responsiblePerson?.email) {
      return
    }

    const subject = `OVERDUE Maintenance: ${maintenance.asset.name}`
    const template = "overdue-maintenance"
    const context = {
      maintenanceName: maintenance.description,
      assetName: maintenance.asset.name,
      dueDate: maintenance.dueDate.toLocaleDateString(),
      type: maintenance.type,
      responsiblePerson: maintenance.responsiblePerson.name,
      daysPastDue: Math.floor((new Date().getTime() - maintenance.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }

    await this.sendEmail(maintenance.responsiblePerson.email, subject, template, context)
  }

  async scheduleMaintenanceNotification(maintenance: Maintenance, notificationDate: Date): Promise<void> {
    // This would integrate with a job queue like Bull or Agenda
    // For now, we'll just log the scheduled notification
    console.log(`Scheduled notification for maintenance ${maintenance.id} on ${notificationDate}`)
  }

  private async sendEmail(to: string, subject: string, template: string, context: any): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      })
    } catch (error) {
      console.error("Failed to send email:", error)
    }
  }
}
