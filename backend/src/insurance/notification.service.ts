import { Injectable, Logger } from '@nestjs/common';
import { AssetInsurance } from './asset-insurance.entity';

/**
 * Replace/extend this service to integrate with your email/SMS/push provider.
 * For now it logs and pretends to send.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyExpiry(policy: AssetInsurance, daysBeforeExpiry: number) {
    // Example payload; adapt to your notification template & recipients
    const message = `Policy ${policy.policyNumber} for asset ${policy.assetId} expires on ${policy.expiryDate.toISOString()} (in ${daysBeforeExpiry} day(s) or less). Provider: ${policy.provider}.`;
    // TODO: send email / sms / push using your provider
    this.logger.warn(`[ExpiryNotification] ${message}`);

    // If you integrate email, you may add:
    // await this.mailerService.sendMail({ to: 'ops@example.com', subject: 'Policy expiry', text: message });
    return Promise.resolve(true);
  }
}
