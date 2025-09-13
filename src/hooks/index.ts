import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightTheme, darkTheme } from '../constants';
import type { Theme } from '../types';

// Re-export useAuth from its own file
export { useAuth } from './useAuth';

export const useTheme = () => {
  // Always start in light mode (sunny)
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    // Force light theme on initial load
    setIsDark(false);
    setTheme(lightTheme);

    // Optional: Still listen for system theme changes but don't apply them automatically
    // const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    //   // User can manually toggle if needed
    // });

    // return () => subscription?.remove();
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setTheme(newIsDark ? darkTheme : lightTheme);
  };

  return {
    theme,
    isDark,
    toggleTheme,
  };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useAsyncState = <T>() => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const execute = async (asyncFunction: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(undefined);
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(undefined);
    setError(undefined);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
