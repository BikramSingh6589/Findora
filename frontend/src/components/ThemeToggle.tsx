import React, { useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggleClick = () => {
    // Get button position
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Create ripple effect
    createRippleTransition(x, y);

    // Toggle theme
    toggleTheme();
  };

  const createRippleTransition = (x: number, y: number) => {
    // Create a pseudo-element to show the ripple
    const ripple = document.createElement('div');
    ripple.className = 'theme-transition-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);

    // Trigger animation
    requestAnimationFrame(() => {
      ripple.classList.add('active');
    });

    // Remove after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 750);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleToggleClick}
      className="relative p-2.5 rounded-full transition-all duration-300 hover:bg-surface-container-low dark:hover:bg-surface-container-low/20 text-text-secondary hover:text-text-primary dark:text-text-secondary dark:hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`${theme === 'light' ? 'Dark' : 'Light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
