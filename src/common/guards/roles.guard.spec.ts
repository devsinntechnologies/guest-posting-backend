import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createContext = (user: { role: UserRole } | null): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as ExecutionContext;

  it('allows access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext(null))).toBe(true);
  });

  it('allows access for matching role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.EDITOR]);
    expect(guard.canActivate(createContext({ role: UserRole.EDITOR }))).toBe(
      true,
    );
  });

  it('denies access for non-matching role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.SUPER_ADMIN]);
    expect(() =>
      guard.canActivate(createContext({ role: UserRole.CONTRIBUTOR })),
    ).toThrow(ForbiddenException);
  });

  it('denies access when user is missing', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.EDITOR]);
    expect(() => guard.canActivate(createContext(null))).toThrow(
      ForbiddenException,
    );
  });
});
