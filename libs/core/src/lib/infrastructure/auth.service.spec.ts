import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    service = new AuthService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with unauthenticated state', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should login user and update signals', async () => {
    const user = await service.login({ email: 'test@example.com', pass: 'password' });
    expect(user.email).toBe('test@example.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('test@example.com');
  });

  it('should logout user and clear signals', async () => {
    await service.login({ email: 'test@example.com', pass: 'password' });
    expect(service.isAuthenticated()).toBe(true);
    await service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
