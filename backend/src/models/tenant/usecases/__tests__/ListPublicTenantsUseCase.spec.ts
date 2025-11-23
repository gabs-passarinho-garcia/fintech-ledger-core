import { describe, it, expect, mock } from 'bun:test';
import { ListPublicTenantsUseCase } from '../ListPublicTenantsUseCase';
import type { ILogger } from '@/common/interfaces/ILogger';
import type { ListPublicTenantsRepository } from '../../infra/repositories/ListPublicTenantsRepository';
import { AppProviders } from '@/common/interfaces/IAppContainer';

describe('ListPublicTenantsUseCase', () => {
  const setup = () => {
    const mockLogger: ILogger = {
      debug: mock(),
      info: mock(),
      warn: mock(),
      error: mock(),
      log: mock(),
    };

    const mockListPublicTenantsRepository: ListPublicTenantsRepository = {
      listPublic: mock(),
    } as unknown as ListPublicTenantsRepository;

    const useCase = new ListPublicTenantsUseCase({
      [AppProviders.logger]: mockLogger,
      [AppProviders.listPublicTenantsRepository]: mockListPublicTenantsRepository,
    });

    return {
      useCase,
      mockLogger,
      mockListPublicTenantsRepository,
    };
  };

  describe('execute', () => {
    it('should return list of public tenants with id and name only', async () => {
      const { useCase, mockListPublicTenantsRepository } = setup();

      (mockListPublicTenantsRepository.listPublic as ReturnType<typeof mock>).mockResolvedValue([
        {
          id: 'tenant-1',
          name: 'Tenant 1',
        },
        {
          id: 'tenant-2',
          name: 'Tenant 2',
        },
      ]);

      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(2);
      expect(result.tenants[0]?.id).toBe('tenant-1');
      expect(result.tenants[0]?.name).toBe('Tenant 1');
      expect(result.tenants[1]?.id).toBe('tenant-2');
      expect(result.tenants[1]?.name).toBe('Tenant 2');
    });

    it('should return empty array when no tenants exist', async () => {
      const { useCase, mockListPublicTenantsRepository } = setup();

      (mockListPublicTenantsRepository.listPublic as ReturnType<typeof mock>).mockResolvedValue(
        [],
      );

      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(0);
    });

    it('should not require authentication (no session needed)', async () => {
      const { useCase, mockListPublicTenantsRepository } = setup();

      (mockListPublicTenantsRepository.listPublic as ReturnType<typeof mock>).mockResolvedValue([
        {
          id: 'tenant-1',
          name: 'Tenant 1',
        },
      ]);

      // Should execute without throwing authentication errors
      const result = await useCase.execute({});

      expect(result.tenants).toBeDefined();
      expect(result.tenants.length).toBe(1);
    });
  });
});

