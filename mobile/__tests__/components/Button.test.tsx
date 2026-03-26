// mobile/__tests__/components/Button.test.tsx

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component Tests', () => {
  it('should render button with label', () => {
    render(<Button label="Click Me" onPress={() => {}} />);
    
    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when button is pressed', () => {
    const mockPress = jest.fn();
    render(<Button label="Click Me" onPress={mockPress} />);
    
    fireEvent.press(screen.getByText('Click Me'));
    
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('should not be pressable when disabled', () => {
    const mockPress = jest.fn();
    render(
      <Button label="Disabled" onPress={mockPress} disabled={true} />
    );
    
    fireEvent.press(screen.getByText('Disabled'));
    
    expect(mockPress).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const mockPress = jest.fn();
    render(
      <Button
        label="Loading"
        onPress={mockPress}
        disabled={true}
        loading={true}
      />
    );
    
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  it('should support different variants', () => {
    const { rerender } = render(
      <Button label="Primary" variant="primary" onPress={() => {}} />
    );
    
    expect(screen.getByText('Primary')).toBeTruthy();

    rerender(
      <Button label="Secondary" variant="secondary" onPress={() => {}} />
    );
    
    expect(screen.getByText('Secondary')).toBeTruthy();
  });

  it('should support different sizes', () => {
    const { rerender } = render(
      <Button label="Small" size="small" onPress={() => {}} />
    );
    
    expect(screen.getByText('Small')).toBeTruthy();

    rerender(
      <Button label="Large" size="large" onPress={() => {}} />
    );
    
    expect(screen.getByText('Large')).toBeTruthy();
  });
});
