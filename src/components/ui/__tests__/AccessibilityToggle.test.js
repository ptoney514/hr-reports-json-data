/**
 * Comprehensive accessibility tests for AccessibilityToggle component
 * Tests WCAG 2.1 AA compliance, keyboard navigation, screen reader support,
 * and all accessibility feature toggles
 */

import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, accessibilityTestUtils, setupTestEnvironment } from '../../../utils/testUtils';
import AccessibilityToggle from '../AccessibilityToggle';

// Setup test environment
beforeEach(() => {
  setupTestEnvironment.accessibility();
  setupTestEnvironment.performance();
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset document classes
  document.documentElement.className = '';
});

afterEach(() => {
  setupTestEnvironment.cleanup();
});

describe('AccessibilityToggle Component', () => {
  describe('Basic Accessibility Compliance', () => {
    test('passes axe accessibility audit when closed', async () => {
      const { container } = renderWithRouter(<AccessibilityToggle />);
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('passes axe accessibility audit when open', async () => {
      const { container, user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      await accessibilityTestUtils.expectNoAccessibilityViolations(container);
    });

    test('has proper ARIA attributes on toggle button', () => {
      renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      
      expect(toggleButton).toHaveAttribute('aria-label', 'Accessibility settings');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute('aria-haspopup', 'true');
      expect(toggleButton).toHaveAttribute('title', 'Accessibility Settings');
    });

    test('updates ARIA attributes when dropdown opens', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('dropdown has proper dialog role and ARIA attributes', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label', 'Accessibility options');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('opens dropdown with Enter key', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      toggleButton.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    test('opens dropdown with Space key', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      toggleButton.focus();
      await user.keyboard(' ');
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    test('closes dropdown with Escape key', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('navigates through toggle switches with Tab', async () => {
      const { user, container } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Test keyboard navigation through switches
      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(6); // 6 accessibility toggles
      
      await accessibilityTestUtils.testKeyboardNavigation(container, user);
    });

    test('traps focus within dropdown when open', async () => {
      const { user, container } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      await accessibilityTestUtils.testFocusManagement(
        container, 
        user, 
        '[role="dialog"]'
      );
    });
  });

  describe('High Contrast Toggle', () => {
    test('toggles high contrast mode', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const highContrastSwitch = screen.getByRole('switch', { name: /toggle high contrast/i });
      expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');
      
      await user.click(highContrastSwitch);
      
      expect(highContrastSwitch).toHaveAttribute('aria-checked', 'true');
      expect(document.documentElement).toHaveClass('high-contrast-mode');
      expect(localStorage.getItem('high-contrast-mode')).toBe('true');
    });

    test('initializes high contrast from localStorage', () => {
      localStorage.setItem('high-contrast-mode', 'true');
      
      renderWithRouter(<AccessibilityToggle />);
      
      expect(document.documentElement).toHaveClass('high-contrast-mode');
    });

    test('announces high contrast state changes', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const highContrastSwitch = screen.getByRole('switch', { name: /toggle high contrast/i });
      
      await user.click(highContrastSwitch);
      
      await accessibilityTestUtils.testScreenReaderAnnouncements([
        { text: 'High contrast mode enabled', level: 'polite' }
      ]);
    });
  });

  describe('Reduced Motion Toggle', () => {
    test('toggles reduced motion mode', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const reducedMotionSwitch = screen.getByRole('switch', { name: /toggle reduced motion/i });
      expect(reducedMotionSwitch).toHaveAttribute('aria-checked', 'false');
      
      await user.click(reducedMotionSwitch);
      
      expect(reducedMotionSwitch).toHaveAttribute('aria-checked', 'true');
      expect(document.documentElement).toHaveClass('reduce-motion');
      expect(localStorage.getItem('reduced-motion')).toBe('true');
    });

    test('respects system prefers-reduced-motion preference', () => {
      // Mock matchMedia for prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderWithRouter(<AccessibilityToggle />);
      
      expect(document.documentElement).toHaveClass('reduce-motion');
    });
  });

  describe('Large Text Toggle', () => {
    test('toggles large text mode', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const largeTextSwitch = screen.getByRole('switch', { name: /toggle large text/i });
      expect(largeTextSwitch).toHaveAttribute('aria-checked', 'false');
      
      await user.click(largeTextSwitch);
      
      expect(largeTextSwitch).toHaveAttribute('aria-checked', 'true');
      expect(document.documentElement).toHaveClass('large-text');
      expect(localStorage.getItem('large-text')).toBe('true');
    });

    test('applies large text styles correctly', async () => {
      const { user, container } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const largeTextSwitch = screen.getByRole('switch', { name: /toggle large text/i });
      await user.click(largeTextSwitch);
      
      // Verify large text CSS is applied
      const style = container.querySelector('style');
      expect(style.textContent).toContain('.large-text');
      expect(style.textContent).toContain('font-size: 1.125em');
    });
  });

  describe('Keyboard Navigation Enhancement', () => {
    test('toggles enhanced keyboard navigation', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const keyboardNavSwitch = screen.getByRole('switch', { name: /toggle enhanced keyboard navigation/i });
      expect(keyboardNavSwitch).toHaveAttribute('aria-checked', 'false');
      
      await user.click(keyboardNavSwitch);
      
      expect(keyboardNavSwitch).toHaveAttribute('aria-checked', 'true');
      expect(document.documentElement).toHaveClass('keyboard-navigation-enhanced');
      expect(localStorage.getItem('keyboard-navigation')).toBe('true');
    });
  });

  describe('Screen Reader Optimization', () => {
    test('toggles screen reader optimization', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const screenReaderSwitch = screen.getByRole('switch', { name: /toggle screen reader optimization/i });
      expect(screenReaderSwitch).toHaveAttribute('aria-checked', 'false');
      
      await user.click(screenReaderSwitch);
      
      expect(screenReaderSwitch).toHaveAttribute('aria-checked', 'true');
      expect(document.documentElement).toHaveClass('screen-reader-optimized');
      expect(localStorage.getItem('screen-reader-optimized')).toBe('true');
    });
  });

  describe('Sound Feedback Toggle', () => {
    test('toggles sound feedback', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const soundSwitch = screen.getByRole('switch', { name: /toggle sound feedback/i });
      expect(soundSwitch).toHaveAttribute('aria-checked', 'true'); // Default is enabled
      
      await user.click(soundSwitch);
      
      expect(soundSwitch).toHaveAttribute('aria-checked', 'false');
      expect(localStorage.getItem('sound-enabled')).toBe('false');
    });
  });

  describe('Click Outside Behavior', () => {
    test('closes dropdown when clicking outside', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Click outside the dropdown
      await user.click(document.body);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('does not close when clicking inside dropdown', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const dialog = screen.getByRole('dialog');
      await user.click(dialog);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Switch Components Accessibility', () => {
    test('all switches have proper ARIA attributes', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const switches = screen.getAllByRole('switch');
      
      switches.forEach(switchElement => {
        expect(switchElement).toHaveAttribute('role', 'switch');
        expect(switchElement).toHaveAttribute('aria-checked');
        expect(switchElement).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });

    test('switches have associated labels', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const expectedLabels = [
        'high-contrast-toggle',
        'reduced-motion-toggle',
        'large-text-toggle',
        'keyboard-nav-toggle',
        'screen-reader-toggle',
        'sound-toggle'
      ];
      
      expectedLabels.forEach(labelId => {
        const label = document.querySelector(`label[for="${labelId}"]`);
        const input = document.getElementById(labelId);
        
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });

    test('switches respond to Space and Enter keys', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const highContrastSwitch = screen.getByRole('switch', { name: /toggle high contrast/i });
      highContrastSwitch.focus();
      
      // Test Space key
      await user.keyboard(' ');
      expect(highContrastSwitch).toHaveAttribute('aria-checked', 'true');
      
      // Test Enter key
      await user.keyboard('{Enter}');
      expect(highContrastSwitch).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Keyboard Navigation Help Section', () => {
    test('displays keyboard navigation help', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
      expect(screen.getByText(/Tab.*Navigate between elements/)).toBeInTheDocument();
      expect(screen.getByText(/Arrow keys.*Navigate charts and tables/)).toBeInTheDocument();
      expect(screen.getByText(/Enter\/Space.*Activate buttons and links/)).toBeInTheDocument();
      expect(screen.getByText(/Esc.*Close dialogs and menus/)).toBeInTheDocument();
    });

    test('keyboard shortcuts are properly marked up', async () => {
      const { user } = renderWithRouter(<AccessibilityToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const kbdElements = screen.getAllByRole('generic');
      const kbdShortcuts = kbdElements.filter(el => el.tagName === 'KBD');
      
      expect(kbdShortcuts.length).toBeGreaterThan(0);
      kbdShortcuts.forEach(kbd => {
        expect(kbd).toHaveClass('px-1', 'py-0.5', 'bg-gray-100', 'rounded', 'text-xs');
      });
    });
  });

  describe('Performance and Memory', () => {
    test('component renders within performance budget', async () => {
      const startTime = performance.now();
      renderWithRouter(<AccessibilityToggle />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(50); // Should render in under 50ms
    });

    test('does not create memory leaks on unmount', () => {
      const { unmount } = renderWithRouter(<AccessibilityToggle />);
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      unmount();
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Memory usage should not increase significantly
      expect(finalMemory - initialMemory).toBeLessThan(1000000); // 1MB threshold
    });
  });

  describe('State Persistence', () => {
    test('persists all accessibility settings across remounts', async () => {
      const { user, unmount } = renderWithRouter(<AccessibilityToggle />);
      
      // Set all preferences
      const toggleButton = screen.getByRole('button', { name: /accessibility settings/i });
      await user.click(toggleButton);
      
      const switches = screen.getAllByRole('switch');
      for (const switchElement of switches) {
        await user.click(switchElement);
      }
      
      unmount();
      
      // Remount and verify persistence
      renderWithRouter(<AccessibilityToggle />);
      
      expect(localStorage.getItem('high-contrast-mode')).toBe('true');
      expect(localStorage.getItem('reduced-motion')).toBe('true');
      expect(localStorage.getItem('large-text')).toBe('true');
      expect(localStorage.getItem('keyboard-navigation')).toBe('true');
      expect(localStorage.getItem('screen-reader-optimized')).toBe('true');
      expect(localStorage.getItem('sound-enabled')).toBe('false'); // Was true by default
    });
  });
});