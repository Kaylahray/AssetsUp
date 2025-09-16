// Entity for deactivation requests
export class DeactivationRequest {
  id: number;
  deviceId: string;
  reason: string;
  requesterId: string;
  timestamp: Date;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';

  constructor(id: number, deviceId: string, reason: string, requesterId: string) {
    this.id = id;
    this.deviceId = deviceId;
    this.reason = reason;
    this.requesterId = requesterId;
    this.timestamp = new Date();
    this.status = 'PENDING';
  }
}
