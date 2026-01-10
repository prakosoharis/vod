import { useEffect, useRef } from 'react';
import { useFocusStore } from '../stores';

export function useFocusable(id: string) {
  const { focusedId, setFocusedId } = useFocusStore();
  const elementRef = useRef<HTMLElement>(null);

  const isFocused = focusedId === id;

  useEffect(() => {
    if (isFocused && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const element = elementRef.current;
    if (!element) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        break;
      case 'Enter':
        e.preventDefault();
        break;
    }
  };

  return {
    ref: elementRef,
    isFocused,
    onFocus: () => setFocusedId(id),
    onBlur: () => {},
    onKeyDown: handleKeyDown,
  };
}

export function useKeyboardNavigation(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { focusedId, moveFocus } = useFocusStore.getState();

      if (focusedId) {
        const container = document.getElementById(focusedId)?.closest('[data-focusable-container]');
        if (container) {
          const focusableElements = container.querySelectorAll('[data-focusable]:not([disabled])');
          const items = Array.from(focusableElements).map((el) => el.id).filter(Boolean);

          if (items.length > 0) {
            switch (e.key) {
              case 'ArrowUp':
                e.preventDefault();
                moveFocus('up', items);
                break;
              case 'ArrowDown':
                e.preventDefault();
                moveFocus('down', items);
                break;
              case 'ArrowLeft':
                e.preventDefault();
                moveFocus('left', items);
                break;
              case 'ArrowRight':
                e.preventDefault();
                moveFocus('right', items);
                break;
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
