import { describe, it, expect, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('should render with primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button.className).toContain('bg-primary-500');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button.className).toContain('bg-gray-200');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button.className).toContain('bg-secondary-red');
  });

  it('should show loading state', () => {
    const { container } = render(<Button isLoading>Submit</Button>);
    const button = container.querySelector('button[data-testid="button"]');
    expect(button?.textContent).toContain('Loading...');
  });

  it('should be disabled when loading', () => {
    const { container } = render(<Button isLoading>Submit</Button>);
    const button = container.querySelector('button[data-testid="button"]') as HTMLButtonElement;
    expect(button?.disabled).toBe(true);
  });
});

