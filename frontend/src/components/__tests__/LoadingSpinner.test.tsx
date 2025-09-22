import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    render(<LoadingSpinner />);
    
    // Check if the spinner SVG is present
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('has correct accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  test('applies correct CSS classes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('img', { hidden: true });
    expect(spinner).toHaveClass('lucide', 'lucide-refresh-cw', 'animate-spin');
  });
});
