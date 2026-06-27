/**
 * Spatial Navigation System for LG webOS TV
 *
 * Handles D-pad (arrow keys) navigation between focusable elements.
 * Uses a focus registry organized by (row, column) for grid-like layout,
 * plus free-form 2D distance fallback for non-grid layouts.
 *
 * LG remote buttons → key codes:
 *   - Arrow Up/Down/Left/Right: navigate spatial
 *   - Enter (OK): activate element
 *   - Backspace / Escape: back
 *   - 409 (Back): webOS-specific back key
 */

import { useEffect, useState, useCallback, useRef } from 'react';

type FocusableElement = HTMLDivElement & {
  dataset: {
    focusKey?: string;
    focusRow?: string;
    focusCol?: string;
    focusDisabled?: string;
  };
};

// Global focus registry
const focusRegistry = new Map<string, FocusableElement>();
let currentFocusKey: string | null = null;
const focusListeners = new Set<(key: string | null) => void>();

function notifyFocusChange(key: string | null) {
  currentFocusKey = key;
  focusListeners.forEach((l) => l(key));
}

export function registerFocusable(key: string, el: FocusableElement) {
  focusRegistry.set(key, el);
}

export function unregisterFocusable(key: string) {
  focusRegistry.delete(key);
  if (currentFocusKey === key) {
    currentFocusKey = null;
  }
}

export function setFocus(key: string) {
  const el = focusRegistry.get(key);
  if (el) {
    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    notifyFocusChange(key);
  }
}

export function getCurrentFocus(): string | null {
  return currentFocusKey;
}

// Compute distance between two elements (for nearest-neighbor fallback)
function getCenter(el: Element): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function findBestCandidate(
  direction: 'up' | 'down' | 'left' | 'right'
): string | null {
  if (!currentFocusKey) return null;
  const currentEl = focusRegistry.get(currentFocusKey);
  if (!currentEl) return null;

  const currentCenter = getCenter(currentEl);
  let bestKey: string | null = null;
  let bestScore = Infinity;

  focusRegistry.forEach((el, key) => {
    if (key === currentFocusKey) return;
    if (el.dataset.focusDisabled === 'true') return;

    const center = getCenter(el);
    const dx = center.x - currentCenter.x;
    const dy = center.y - currentCenter.y;

    // Direction filter: element must be in the requested direction
    let isCorrectDirection = false;
    switch (direction) {
      case 'up':
        isCorrectDirection = dy < -10;
        break;
      case 'down':
        isCorrectDirection = dy > 10;
        break;
      case 'left':
        isCorrectDirection = dx < -10;
        break;
      case 'right':
        isCorrectDirection = dx > 10;
        break;
    }

    if (!isCorrectDirection) return;

    // Weighted distance: heavily weight the primary axis
    let score: number;
    if (direction === 'up' || direction === 'down') {
      score = Math.abs(dy) + Math.abs(dx) * 3;
    } else {
      score = Math.abs(dx) + Math.abs(dy) * 3;
    }

    if (score < bestScore) {
      bestScore = score;
      bestKey = key;
    }
  });

  return bestKey;
}

// Hook for using spatial navigation
export function useSpatialNavigation(options?: {
  onBack?: () => void;
  enabled?: boolean;
}) {
  const [, setTick] = useState(0);
  const onFocusChange = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    focusListeners.add(onFocusChange);
    return () => {
      focusListeners.delete(onFocusChange);
    };
  }, [onFocusChange]);

  useEffect(() => {
    if (options?.enabled === false) return;

    const handleKey = (e: KeyboardEvent) => {
      // webOS-specific: 409 is Back, 13 is Enter (OK)
      if (e.keyCode === 409 || (e.key === 'Escape' && options?.onBack)) {
        e.preventDefault();
        options?.onBack?.();
        return;
      }

      if (e.key === 'Backspace' && options?.onBack) {
        // Only handle backspace when not focused on input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          options?.onBack?.();
        }
        return;
      }

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
      }

      if (direction) {
        const next = findBestCandidate(direction);
        if (next) {
          e.preventDefault();
          setFocus(next);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [options?.onBack, options?.enabled]);

  return {
    currentFocusKey,
    setFocus,
  };
}

// Hook for registering a focusable element
export function useFocusable(
  focusKey: string,
  options?: {
    onEnter?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    disabled?: boolean;
    row?: number;
    col?: number;
  }
) {
  const ref = useRef<FocusableElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.dataset.focusKey = focusKey;
    if (options?.row !== undefined) el.dataset.focusRow = String(options.row);
    if (options?.col !== undefined) el.dataset.focusCol = String(options.col);
    el.dataset.focusDisabled = options?.disabled ? 'true' : 'false';
    el.tabIndex = -1; // programmatically focusable, not via tab key

    registerFocusable(focusKey, el);

    const handleClick = (e: MouseEvent) => {
      if (options?.disabled) return;
      e.preventDefault();
      setFocus(focusKey);
      options?.onEnter?.();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (options?.disabled) return;
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        options?.onEnter?.();
      }
    };

    const handleFocus = () => {
      notifyFocusChange(focusKey);
      options?.onFocus?.();
    };

    const handleBlur = () => {
      options?.onBlur?.();
    };

    el.addEventListener('click', handleClick);
    el.addEventListener('keydown', handleKey);
    el.addEventListener('focus', handleFocus);
    el.addEventListener('blur', handleBlur);

    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('keydown', handleKey);
      el.removeEventListener('focus', handleFocus);
      el.removeEventListener('blur', handleBlur);
      unregisterFocusable(focusKey);
    };
  }, [focusKey, options?.onEnter, options?.onFocus, options?.onBlur, options?.disabled, options?.row, options?.col]);

  return ref;
}

// Check if element is currently focused
export function useIsFocused(focusKey: string): boolean {
  const [isFocused, setIsFocused] = useState(currentFocusKey === focusKey);

  useEffect(() => {
    const listener = (key: string | null) => {
      setIsFocused(key === focusKey);
    };
    focusListeners.add(listener);
    return () => {
      focusListeners.delete(listener);
    };
  }, [focusKey]);

  return isFocused;
}
