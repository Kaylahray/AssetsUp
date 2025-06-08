import { Injectable, Logger } from "@nestjs/common"
import type { Asset } from "../entities/asset.entity"
import type { MaintenanceSchedule } from "../entities/maintenance-schedule.entity"

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  async sendOverdueAssetNotification(recipient: string, overdueAssets: Asset[]): Promise<void> {
    try {
      // In a real implementation, you would integrate with an email service
      // like SendGrid, AWS SES, or similar
      const emailContent = this.generateOverdueAssetEmail(overdueAssets)

      this.logger.log(`Sending overdue asset notification to ${recipient}`)
      this.logger.debug(`Email content: ${emailContent}`)

      // Simulate email sending
      await this.simulateEmailSend(recipient, "Overdue Assets Alert", emailContent)
    } catch (error) {
      this.logger.error(`Failed to send overdue asset notification to ${recipient}:`, error)
    }
  }

  async sendMaintenanceReminder(
    recipient: string,
    maintenance: MaintenanceSchedule,
    daysUntilDue: number,
  ): Promise<void> {
    try {
      const emailContent = this.generateMaintenanceReminderEmail(maintenance, daysUntilDue)

      this.logger.log(`Sending maintenance reminder to ${recipient} for ${maintenance.title}`)
      this.logger.debug(`Email content: ${emailContent}`)

      // Simulate email sending
      await this.simulateEmailSend(recipient, `Maintenance Reminder: ${maintenance.title}`, emailContent)
    } catch (error) {
      this.logger.error(`Failed to send maintenance reminder to ${recipient}:`, error)
    }
  }

  async sendLowStockNotification(recipient: string, stockData: any): Promise<void> {
    try {
      const emailContent = this.generateLowStockEmail(stockData)

      this.logger.log(`Sending low stock notification to ${recipient}`)
      this.logger.debug(`Email content: ${emailContent}`)

      // Simulate email sending
      await this.simulateEmailSend(recipient, "Low Stock Alert", emailContent)
    } catch (error) {
      this.logger.error(`Failed to send low stock notification to ${recipient}:`, error)
    }
  }

  private generateOverdueAssetEmail(overdueAssets: Asset[]): string {
    let content = `
      <h2>Overdue Assets Alert</h2>
      <p>The following assets are past their due dates:</p>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Asset Code</th>
            <th>Name</th>
            <th>Due Date</th>
            <th>Days Overdue</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
    `

    overdueAssets.forEach((asset) => {
      const daysOverdue = Math.floor((new Date().getTime() - asset.dueDate.getTime()) / (1000 * 60 * 60 * 24))

      content += `
        <tr>
          <td>${asset.assetCode}</td>
          <td>${asset.name}</td>
          <td>${asset.dueDate.toDateString()}</td>
          <td>${daysOverdue}</td>
          <td>${asset.assignedTo || "Unassigned"}</td>
        </tr>
      `
    })

    content += `
        </tbody>
      </table>
      <p>Please take immediate action to address these overdue assets.</p>
    `

    return content
  }

  private generateMaintenanceReminderEmail(maintenance: MaintenanceSchedule, daysUntilDue: number): string {
    return `
      <h2>Maintenance Reminder</h2>
      <p><strong>Title:</strong> ${maintenance.title}</p>
      <p><strong>Description:</strong> ${maintenance.description || "No description provided"}</p>
      <p><strong>Scheduled Date:</strong> ${maintenance.scheduledDate.toDateString()}</p>
      <p><strong>Days Until Due:</strong> ${daysUntilDue}</p>
      <p><strong>Priority:</strong> ${maintenance.priority.toUpperCase()}</p>
      <p><strong>Estimated Duration:</strong> ${maintenance.estimatedDuration} minutes</p>
      
      ${
        maintenance.checklist && maintenance.checklist.length > 0
          ? `
        <h3>Checklist:</h3>
        <ul>
          ${maintenance.checklist.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      `
          : ""
      }
      
      <p>Please ensure this maintenance is completed on time.</p>
    `
  }

  private generateLowStockEmail(stockData: any): string {
    let content = `
      <h2>Low Stock Alert</h2>
      <p>The following inventory items require attention:</p>
    `

    if (stockData.criticalItems.length > 0) {
      content += `
        <h3>Critical Stock Levels (Immediate Action Required)</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Current Stock</th>
              <th>Critical Threshold</th>
              <th>Category</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
      `

      stockData.criticalItems.forEach((item) => {
        content += `
          <tr style="background-color: #ffebee;">
            <td>${item.sku}</td>
            <td>${item.name}</td>
            <td>${item.currentStock}</td>
            <td>${item.criticalThreshold}</td>
            <td>${item.category || "N/A"}</td>
            <td>${item.supplier || "N/A"}</td>
          </tr>
        `
      })

      content += `
          </tbody>
        </table>
      `
    }

    if (stockData.lowStockItems.length > 0) {
      content += `
        <h3>Low Stock Levels</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Current Stock</th>
              <th>Minimum Threshold</th>
              <th>Category</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
      `

      stockData.lowStockItems.forEach((item) => {
        content += `
          <tr style="background-color: #fff3e0;">
            <td>${item.sku}</td>
            <td>${item.name}</td>
            <td>${item.currentStock}</td>
            <td>${item.minimumThreshold}</td>
            <td>${item.category || "N/A"}</td>
            <td>${item.supplier || "N/A"}</td>
          </tr>
        `
      })

      content += `
          </tbody>
        </table>
      `
    }

    content += `<p>Please review and take appropriate action to restock these items.</p>`

    return content
  }

  private async simulateEmailSend(recipient: string, subject: string, content: string): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.logger.log(`📧 Email sent to: ${recipient}`)
    this.logger.log(`📧 Subject: ${subject}`)

    // In production, replace this with actual email service integration:
    // - SendGrid: await this.sendgridService.send({ to: recipient, subject, html: content });
    // - AWS SES: await this.sesService.sendEmail({ to: recipient, subject, html: content });
    // - Nodemailer: await this.mailerService.sendMail({ to: recipient, subject, html: content });
  }
}
