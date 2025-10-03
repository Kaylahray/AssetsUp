
import { EventEmitter2 } from '@nestjs/event-emitter';

export class AssetsService {
  constructor(private repo: any, private eventEmitter: EventEmitter2) {
    // Initialization logic if needed
  }

  createAsset(data) {
    const asset = this.repo.save(data);
    this.eventEmitter.emit('asset.created', asset);
  }
}

