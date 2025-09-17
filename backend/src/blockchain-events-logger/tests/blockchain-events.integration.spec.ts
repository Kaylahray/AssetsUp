import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { BlockchainEventsModule } from '../blockchain-events.module';
import { BlockchainEvent } from '../entities/blockchain-event.entity';
import { BlockchainEventType, BlockchainNetwork, EventStatus, EventPriority } from '../blockchain-events.enums';

describe('BlockchainEventsController (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<BlockchainEvent>;

  const mockEvent = {
    assetId: 'asset-123',
    eventType: BlockchainEventType.ASSET_TRANSFER,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: '123456',
    timestamp: '2024-01-15T10:30:00Z',
    eventDetails: { amount: '1000000000000000000' },
    network: BlockchainNetwork.STARKNET_MAINNET,
    status: EventStatus.PENDING,
    priority: EventPriority.MEDIUM,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [BlockchainEvent],
          synchronize: true,
        }),
        BlockchainEventsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    repository = moduleFixture.get('BlockchainEventRepository');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  describe('/blockchain-events (POST)', () => {
    it('should create a blockchain event', () => {
      return request(app.getHttpServer())
        .post('/blockchain-events')
        .send(mockEvent)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.transactionHash).toBe(mockEvent.transactionHash);
          expect(res.body.eventType).toBe(mockEvent.eventType);
        });
    });

    it('should reject duplicate transaction hash', async () => {
      await request(app.getHttpServer())
        .post('/blockchain-events')
        .send(mockEvent)
        .expect(201);

      return request(app.getHttpServer())
        .post('/blockchain-events')
        .send(mockEvent)
        .expect(409);
    });
  });

  describe('/blockchain-events (GET)', () => {
    beforeEach(async () => {
      await repository.save(repository.create(mockEvent));
    });

    it('should return paginated events', () => {
      return request(app.getHttpServer())
        .get('/blockchain-events')
        .expect(200)
        .expect((res) => {
          expect(res.body.events).toHaveLength(1);
          expect(res.body.total).toBe(1);
          expect(res.body.analytics).toBeDefined();
        });
    });

    it('should filter by asset ID', () => {
      return request(app.getHttpServer())
        .get('/blockchain-events')
        .query({ assetId: 'asset-123' })
        .expect(200)
        .expect((res) => {
          expect(res.body.events).toHaveLength(1);
          expect(res.body.events[0].assetId).toBe('asset-123');
        });
    });
  });

  describe('/blockchain-events/starknet-payload (POST)', () => {
    const starknetPayload = {
      assetId: 'asset-123',
      eventType: 'asset_transfer',
      receipt: {
        transaction_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        block_number: '654321',
        block_hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        transaction_index: '3',
        status: 'ACCEPTED_ON_L2',
        actual_fee: '9876543210987654',
        events: [],
        execution_resources: { n_steps: 2000 },
        messages_sent: [],
      },
    };

    it('should create event from StarkNet payload', () => {
      return request(app.getHttpServer())
        .post('/blockchain-events/starknet-payload')
        .send(starknetPayload)
        .expect(201)
        .expect((res) => {
          expect(res.body.transactionHash).toBe(starknetPayload.receipt.transaction_hash);
          expect(res.body.blockNumber).toBe(starknetPayload.receipt.block_number);
          expect(res.body.status).toBe(EventStatus.CONFIRMED);
        });
    });
  });
});
