import { useEffect, useState } from 'react';

/**
 * useDebounce — delays updating `value` until `delay` ms have passed
 * without another change. Useful for search inputs.
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
