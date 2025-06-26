import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Contrast, Zap, ZapOff, Settings } from 'lucide-react';
import { highContrastUtils, announceToScreenReader } from '../../utils/accessibilityUtils';

const AccessibilityToggle = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // Initialize accessibility settings on mount
  useEffect(() => {
    // Check for high contrast mode
    const highContrastEnabled = 
      localStorage.getItem('high-contrast-mode') === 'true' ||
      document.documentElement.classList.contains('high-contrast-mode');
    setHighContrast(highContrastEnabled);

    // Check for reduced motion preference
    const reducedMotionEnabled = 
      localStorage.getItem('reduced-motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(reducedMotionEnabled);

    // Check for large text preference
    const largeTextEnabled = localStorage.getItem('large-text') === 'true';
    setLargeText(largeTextEnabled);

    // Apply initial settings
    if (highContrastEnabled) {
      highContrastUtils.applyHighContrastStyles();
    }
    
    if (reducedMotionEnabled) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (largeTextEnabled) {
      document.documentElement.classList.add('large-text');
    }
  }, []);

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    
    if (newState) {
      highContrastUtils.applyHighContrastStyles();
      localStorage.setItem('high-contrast-mode', 'true');
      announceToScreenReader('High contrast mode enabled');
    } else {
      highContrastUtils.removeHighContrastStyles();
      localStorage.setItem('high-contrast-mode', 'false');
      announceToScreenReader('High contrast mode disabled');
    }
  };

  // Toggle reduced motion
  const toggleReducedMotion = () => {
    const newState = !reducedMotion;
    setReducedMotion(newState);
    
    if (newState) {
      document.documentElement.classList.add('reduce-motion');
      localStorage.setItem('reduced-motion', 'true');
      announceToScreenReader('Reduced motion enabled');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      localStorage.setItem('reduced-motion', 'false');
      announceToScreenReader('Reduced motion disabled');
    }
  };

  // Toggle large text
  const toggleLargeText = () => {
    const newState = !largeText;
    setLargeText(newState);
    
    if (newState) {
      document.documentElement.classList.add('large-text');
      localStorage.setItem('large-text', 'true');
      announceToScreenReader('Large text enabled');
    } else {
      document.documentElement.classList.remove('large-text');
      localStorage.setItem('large-text', 'false');
      announceToScreenReader('Large text disabled');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.accessibility-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`accessibility-dropdown relative ${className}`}>
      {/* Toggle Button */}
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Accessibility Settings"
      >
        <Settings size={20} />
        <span className="sr-only">Accessibility Settings</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="menu"
          aria-label="Accessibility options"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Accessibility Settings
            </h3>
            
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Contrast size={20} className="text-gray-600 mr-3" />
                <div>
                  <label 
                    htmlFor="high-contrast-toggle"
                    className="text-sm font-medium text-gray-900 block"
                  >
                    High Contrast
                  </label>
                  <p className="text-xs text-gray-600">
                    Increase contrast for better visibility
                  </p>
                </div>
              </div>
              <button
                id="high-contrast-toggle"
                role="switch"
                aria-checked={highContrast}
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  highContrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Toggle high contrast</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {reducedMotion ? (
                  <ZapOff size={20} className="text-gray-600 mr-3" />
                ) : (
                  <Zap size={20} className="text-gray-600 mr-3" />
                )}
                <div>
                  <label 
                    htmlFor="reduced-motion-toggle"
                    className="text-sm font-medium text-gray-900 block"
                  >
                    Reduced Motion
                  </label>
                  <p className="text-xs text-gray-600">
                    Minimize animations and transitions
                  </p>
                </div>
              </div>
              <button
                id="reduced-motion-toggle"
                role="switch"
                aria-checked={reducedMotion}
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Toggle reduced motion</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Large Text Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {largeText ? (
                  <EyeOff size={20} className="text-gray-600 mr-3" />
                ) : (
                  <Eye size={20} className="text-gray-600 mr-3" />
                )}
                <div>
                  <label 
                    htmlFor="large-text-toggle"
                    className="text-sm font-medium text-gray-900 block"
                  >
                    Large Text
                  </label>
                  <p className="text-xs text-gray-600">
                    Increase text size for better readability
                  </p>
                </div>
              </div>
              <button
                id="large-text-toggle"
                role="switch"
                aria-checked={largeText}
                onClick={toggleLargeText}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  largeText ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Toggle large text</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Navigation Help */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Keyboard Navigation
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Tab</kbd> Navigate between elements</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Arrow keys</kbd> Navigate charts and tables</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter/Space</kbd> Activate buttons and links</p>
                <p><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> Close dialogs and menus</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Large text styles */}
      <style jsx>{`
        .large-text {
          font-size: 1.125em;
        }
        
        .large-text h1 {
          font-size: 2.5rem;
        }
        
        .large-text h2 {
          font-size: 2rem;
        }
        
        .large-text h3 {
          font-size: 1.75rem;
        }
        
        .large-text p,
        .large-text span,
        .large-text div {
          font-size: 1.125rem;
        }
        
        .large-text .text-sm {
          font-size: 1rem;
        }
        
        .large-text .text-xs {
          font-size: 0.875rem;
        }
        
        .large-text button {
          font-size: 1.125rem;
          padding: 0.75rem 1.5rem;
        }
        
        .large-text input,
        .large-text select,
        .large-text textarea {
          font-size: 1.125rem;
          padding: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default AccessibilityToggle; 