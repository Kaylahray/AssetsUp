// Entity for audit logs of deactivation
export class DeactivationAuditLog {
  id: number;
  requestId: number;
  deviceId: string;
  action: string;
  timestamp: Date;
  details: string;

  constructor(id: number, requestId: number, deviceId: string, action: string, details: string) {
    this.id = id;
    this.requestId = requestId;
    this.deviceId = deviceId;
    this.action = action;
    this.timestamp = new Date();
    this.details = details;
  }
}
