import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    service = new EventBusService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit and receive events', (done) => {
    const testEvent = {
      type: 'USER_LOGGED_IN',
      payload: { id: '123' },
      sourceRemote: 'mfe-auth',
      timestamp: Date.now()
    };

    service.on('USER_LOGGED_IN').subscribe((evt) => {
      expect((evt.payload as { id: string }).id).toBe('123');
      done();
    });

    service.emit(testEvent);
  });
});
