
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      onClick={toggleDarkMode}
      variant="outline"
      size="sm"
      className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
