import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './roles.enum';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockExecutionContext = (userRole: Role, requiredRoles?: Role[]): ExecutionContext => {
    mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
    
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: userRole },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = createMockExecutionContext(Role.Employee, undefined);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);
    });

    it('should allow access when roles metadata is empty', () => {
      const context = createMockExecutionContext(Role.Employee, []);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const context = createMockExecutionContext(Role.Admin, [Role.Admin]);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow access when user has one of the required roles', () => {
      const context = createMockExecutionContext(Role.Manager, [Role.Admin, Role.Manager]);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const context = createMockExecutionContext(Role.Employee, [Role.Admin]);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should deny access when user has no role and roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.Admin]);
      
      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should handle multiple role requirements correctly', () => {
      // User is Employee but route requires Admin or Manager
      const context = createMockExecutionContext(Role.Employee, [Role.Admin, Role.Manager]);
      const result = guard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should allow access for Admin accessing Manager routes', () => {
      const context = createMockExecutionContext(Role.Admin, [Role.Manager]);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});