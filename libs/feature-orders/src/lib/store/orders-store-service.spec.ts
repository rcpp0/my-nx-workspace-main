import { TestBed } from '@angular/core/testing';

import { OrdersStoreService } from './orders-store-service';

describe('OrdersStoreService', () => {
  let service: OrdersStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
