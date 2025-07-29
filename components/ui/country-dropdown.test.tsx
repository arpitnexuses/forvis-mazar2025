import { render, screen, fireEvent } from '@testing-library/react';
import { CountryDropdown } from './country-dropdown';

describe('CountryDropdown', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<CountryDropdown value="" onChange={mockOnChange} />);
    expect(screen.getByText('Select your country')).toBeInTheDocument();
  });

  it('shows selected country when value is provided', () => {
    render(<CountryDropdown value="India" onChange={mockOnChange} />);
    expect(screen.getByText('India')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<CountryDropdown value="" onChange={mockOnChange} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByPlaceholderText('Search countries...')).toBeInTheDocument();
  });

  it('filters countries when typing in search', () => {
    render(<CountryDropdown value="" onChange={mockOnChange} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search countries...');
    fireEvent.change(searchInput, { target: { value: 'India' } });
    
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });

  it('calls onChange when a country is selected', () => {
    render(<CountryDropdown value="" onChange={mockOnChange} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const indiaOption = screen.getByText('India');
    fireEvent.click(indiaOption);
    
    expect(mockOnChange).toHaveBeenCalledWith('India');
  });
}); 