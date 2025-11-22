import { describe, it, expect } from 'bun:test';
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
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
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('should be disabled when loading', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByText('Loading...').closest('button');
    expect(button?.disabled).toBe(true);
  });
});

