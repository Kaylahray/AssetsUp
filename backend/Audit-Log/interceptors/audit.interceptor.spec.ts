import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLogService } from '../audit-log.service';
import { AuditAction, AuditResource } from '../entities/audit-log.entity';
import { AuditOptions } from '../decorators/audit.decorator';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditLogService: AuditLogService;
  let reflector: Reflector;

  const mockAuditLogService = {
    log: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext;

  const mockCallHandler = {
    handle: jest.fn(),
  } as unknown as CallHandler;

  let mockRequest: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditLogService = module.get<AuditLogService>(AuditLogService);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = {
      user: {
        id: 'user-123',
        email: 'john.doe@example.com',
      },
      method: 'POST',
      url: '/api/assets',
      headers: {
        'user-agent': 'Mozilla/5.0...',
        'x-forwarded-for': '192.168.1.100',
      },
      body: { name: 'Test Asset' },
      params: { id: 'asset-123' },
      query: {},
      connection: { remoteAddress: '192.168.1.100' },
    };

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should skip audit if no audit options are found', (done) => {
      mockReflector.get.mockReturnValue(undefined);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe('result');
          expect(mockAuditLogService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should skip audit if no user context', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
      };

      mockReflector.get.mockReturnValue(auditOptions);
      mockRequest.user = null;
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe('result');
          expect(mockAuditLogService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should log successful audit event', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
        includeBody: true,
        includeResult: true,
      };

      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of({ id: 'asset-123', name: 'Test Asset' }));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ id: 'asset-123', name: 'Test Asset' });
          expect(mockAuditLogService.log).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: 'user-123',
              actorName: 'john.doe@example.com',
              action: AuditAction.CREATE,
              resource: AuditResource.ASSET,
              resourceId: 'asset-123',
              description: 'Created asset',
              success: true,
              ipAddress: '192.168.1.100',
              userAgent: 'Mozilla/5.0...',
            })
          );
          done();
        },
      });
    });

    it('should log failed audit event', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
      };

      const error = new Error('Validation failed');

      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockAuditLogService.log).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: 'user-123',
              actorName: 'john.doe@example.com',
              action: AuditAction.CREATE,
              resource: AuditResource.ASSET,
              success: false,
              errorMessage: 'Validation failed',
            })
          );
          done();
        },
      });
    });

    it('should skip logging on error if skipOnError is true', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
        skipOnError: true,
      };

      const error = new Error('Validation failed');

      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(throwError(() => error));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockAuditLogService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should extract resource ID from request params', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.UPDATE,
        resource: AuditResource.ASSET,
      };

      mockRequest.params = { id: 'asset-456' };
      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockAuditLogService.log).toHaveBeenCalledWith(
            expect.objectContaining({
              resourceId: 'asset-456',
            })
          );
          done();
        },
      });
    });

    it('should extract resource ID from request body', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
      };

      mockRequest.params = {};
      mockRequest.body = { id: 'asset-789' };
      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockAuditLogService.log).toHaveBeenCalledWith(
            expect.objectContaining({
              resourceId: 'asset-789',
            })
          );
          done();
        },
      });
    });

    it('should sanitize sensitive data', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.CREATE,
        resource: AuditResource.USER,
        includeBody: true,
      };

      mockRequest.body = {
        name: 'John Doe',
        password: 'secret123',
        token: 'abc123',
        email: 'john@example.com',
      };

      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          const logCall = mockAuditLogService.log.mock.calls[0][0];
          expect(logCall.details.requestBody).toEqual({
            name: 'John Doe',
            password: '[REDACTED]',
            token: '[REDACTED]',
            email: 'john@example.com',
          });
          done();
        },
      });
    });

    it('should include query parameters and route parameters in details', (done) => {
      const auditOptions: AuditOptions = {
        action: AuditAction.READ,
        resource: AuditResource.ASSET,
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockRequest.params = { id: 'asset-123' };

      mockReflector.get.mockReturnValue(auditOptions);
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of('result'));
      mockAuditLogService.log.mockResolvedValue({});

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          const logCall = mockAuditLogService.log.mock.calls[0][0];
          expect(logCall.details.queryParams).toEqual({ page: '1', limit: '10' });
          expect(logCall.details.routeParams).toEqual({ id: 'asset-123' });
          done();
        },
      });
    });
  });
});
