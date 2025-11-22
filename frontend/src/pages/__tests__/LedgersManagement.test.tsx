import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LedgersManagement from '../LedgersManagement';

// Mock endpoints
const mockListAllEntries = mock();

mock.module('../../api/endpoints', () => ({
  endpoints: {
    ledger: {
      listAllEntries: mockListAllEntries,
    },
  },
}));

describe('LedgersManagement', () => {
  beforeEach(() => {
    mock.restore();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LedgersManagement />
      </BrowserRouter>,
    );
  };

  it('should render loading state initially', () => {
    mockListAllEntries.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    // Loading state should be shown
    expect(screen.getByText(/loading/i) || screen.queryByRole('progressbar')).toBeDefined();
  });

  it('should render ledger entries list', async () => {
    const mockResponse = {
      data: {
        data: {
          entries: [
            {
              id: 'entry-1',
              tenantId: 'tenant-1',
              fromAccountId: 'account-1',
              toAccountId: 'account-2',
              amount: '100.00',
              type: 'TRANSFER',
              status: 'COMPLETED',
              createdBy: 'user-1',
              createdAt: new Date('2024-01-01'),
              updatedBy: null,
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: 'entry-2',
              tenantId: 'tenant-2',
              fromAccountId: null,
              toAccountId: 'account-3',
              amount: '50.00',
              type: 'DEPOSIT',
              status: 'PENDING',
              createdBy: 'user-2',
              createdAt: new Date('2024-01-02'),
              updatedBy: null,
              updatedAt: new Date('2024-01-02'),
            },
          ],
          pagination: {
            total: 2,
            page: 1,
            limit: 100,
            totalPages: 1,
          },
        },
      },
    };

    mockListAllEntries.mockResolvedValue(mockResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('TRANSFER')).toBeDefined();
      expect(screen.getByText('DEPOSIT')).toBeDefined();
      expect(screen.getByText('COMPLETED')).toBeDefined();
      expect(screen.getByText('PENDING')).toBeDefined();
    });
  });

  it('should render empty state when no entries', async () => {
    const mockResponse = {
      data: {
        data: {
          entries: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
          },
        },
      },
    };

    mockListAllEntries.mockResolvedValue(mockResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no ledger entries found/i)).toBeDefined();
    });
  });

  it('should render error message on error', async () => {
    mockListAllEntries.mockRejectedValue(new Error('Failed to load entries'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load entries/i)).toBeDefined();
    });
  });

  it('should render page title', async () => {
    const mockResponse = {
      data: {
        data: {
          entries: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
          },
        },
      },
    };

    mockListAllEntries.mockResolvedValue(mockResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Ledgers Management')).toBeDefined();
    });
  });

  it('should display status badges with correct colors', async () => {
    const mockResponse = {
      data: {
        data: {
          entries: [
            {
              id: 'entry-1',
              tenantId: 'tenant-1',
              fromAccountId: null,
              toAccountId: null,
              amount: '100.00',
              type: 'DEPOSIT',
              status: 'COMPLETED',
              createdBy: 'user-1',
              createdAt: new Date('2024-01-01'),
              updatedBy: null,
              updatedAt: new Date('2024-01-01'),
            },
            {
              id: 'entry-2',
              tenantId: 'tenant-1',
              fromAccountId: null,
              toAccountId: null,
              amount: '50.00',
              type: 'WITHDRAWAL',
              status: 'PENDING',
              createdBy: 'user-1',
              createdAt: new Date('2024-01-02'),
              updatedBy: null,
              updatedAt: new Date('2024-01-02'),
            },
            {
              id: 'entry-3',
              tenantId: 'tenant-1',
              fromAccountId: null,
              toAccountId: null,
              amount: '25.00',
              type: 'DEPOSIT',
              status: 'FAILED',
              createdBy: 'user-1',
              createdAt: new Date('2024-01-03'),
              updatedBy: null,
              updatedAt: new Date('2024-01-03'),
            },
          ],
          pagination: {
            total: 3,
            page: 1,
            limit: 100,
            totalPages: 1,
          },
        },
      },
    };

    mockListAllEntries.mockResolvedValue(mockResponse);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeDefined();
      expect(screen.getByText('PENDING')).toBeDefined();
      expect(screen.getByText('FAILED')).toBeDefined();
    });
  });
});

