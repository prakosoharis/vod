import { create } from 'zustand';

interface FocusState {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  moveFocus: (direction: 'up' | 'down' | 'left' | 'right', items: string[]) => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  focusedId: null,

  setFocusedId: (id: string | null) => {
    set({ focusedId: id });
    if (id) {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  },

  moveFocus: (direction: 'up' | 'down' | 'left' | 'right', items: string[]) => {
    const { focusedId } = get();
    const currentIndex = items.indexOf(focusedId || '');
    
    let newIndex = currentIndex;
    const isHorizontal = direction === 'left' || direction === 'right';
    const itemsPerRow = isHorizontal ? items.length : Math.ceil(items.length / 3);

    switch (direction) {
      case 'left':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'right':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'up':
        newIndex = currentIndex >= itemsPerRow ? currentIndex - itemsPerRow : currentIndex;
        break;
      case 'down':
        newIndex = currentIndex + itemsPerRow < items.length ? currentIndex + itemsPerRow : currentIndex;
        break;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      get().setFocusedId(items[newIndex] || null);
    }
  },
}));
