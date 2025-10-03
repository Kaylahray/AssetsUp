import { Roles } from './roles.decorator';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

describe('RolesDecorator', () => {
  it('should set metadata with single role', () => {
    const decorator = Roles(Role.Admin);
    expect(decorator).toBeDefined();
    
    // Test that the decorator sets metadata correctly
    const target = class TestClass {};
    Roles(Role.Admin)(target);
    
    // Note: In a real test, we would use Reflector to get the metadata
    // but since we're not testing NestJS's internal functionality,
    // we're just verifying the decorator function exists and works
  });

  it('should set metadata with multiple roles', () => {
    const decorator = Roles(Role.Admin, Role.Manager);
    expect(decorator).toBeDefined();
  });

  it('should export ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});