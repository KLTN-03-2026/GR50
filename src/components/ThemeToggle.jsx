import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-300" />
      )}
    </Button>
  );
}
