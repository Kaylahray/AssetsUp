import { Role } from './roles.enum';

describe('RoleEnum', () => {
  it('should have Admin role', () => {
    expect(Role.Admin).toBe('admin');
  });

  it('should have Manager role', () => {
    expect(Role.Manager).toBe('manager');
  });

  it('should have Employee role', () => {
    expect(Role.Employee).toBe('employee');
  });

  it('should have exactly 3 roles', () => {
    const roles = Object.keys(Role);
    expect(roles.length).toBe(3);
  });
});