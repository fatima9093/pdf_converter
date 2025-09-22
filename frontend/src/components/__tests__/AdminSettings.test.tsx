import { render, screen, waitFor } from '@testing-library/react';
import AdminSettingsComponent from '../AdminSettings';

// Mock the API calls
jest.mock('../../lib/api', () => ({
  apiCall: jest.fn(),
}));

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    isAuthenticated: true,
    loading: false,
  }),
}));

describe('AdminSettings Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<AdminSettingsComponent />);
    
    // Check if loading text is present
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders admin settings after loading', async () => {
    render(<AdminSettingsComponent />);
    
    // Wait for the component to finish loading (mock timeout is 1000ms)
    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check if admin settings sections are rendered
    expect(screen.getByText(/file size limits/i)).toBeInTheDocument();
    expect(screen.getByText(/supported file types/i)).toBeInTheDocument();
    expect(screen.getByText(/api keys/i)).toBeInTheDocument();
    expect(screen.getByText(/admin accounts/i)).toBeInTheDocument();
  });

  test('displays admin accounts correctly', async () => {
    render(<AdminSettingsComponent />);
    
    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check if our updated admin emails are displayed
    expect(screen.getByText('fatimaahmad9093@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('haseeb@webfluxion.com')).toBeInTheDocument();
    expect(screen.getByText('Fatima Ahmad')).toBeInTheDocument();
    expect(screen.getByText('Haseeb')).toBeInTheDocument();
  });

  test('has save settings button', async () => {
    render(<AdminSettingsComponent />);
    
    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Check if save button is present
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });
});
