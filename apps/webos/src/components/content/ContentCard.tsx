import React from 'react';
import { useFocusable } from '../../hooks';
import { Content } from '../../types';
import { cn } from '../../utils';
import Icon from '../ui/Icon';

interface ContentCardProps {
  content: Content;
  onPress: (content: Content) => void;
  onInfoPress?: (content: Content) => void;
  showLock?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onPress,
  onInfoPress,
  showLock = false,
  size = 'small',
}) => {
  const { ref, isFocused, onFocus, onKeyDown } = useFocusable(`content-${content.id}`);

  const sizes = {
    small: { width: 'w-24', height: 'h-36', textSize: 'text-xs' },
    medium: { width: 'w-32', height: 'h-48', textSize: 'text-sm' },
    large: { width: 'w-40', height: 'h-60', textSize: 'text-base' },
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown(e);
    if (e.key === 'Enter') {
      e.preventDefault();
      onPress(content);
    }
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      id={`content-${content.id}`}
      data-focusable
      data-focusable-container="true"
      className={cn(
        'relative flex-shrink-0 cursor-pointer transition-all duration-200',
        sizes[size].width,
        sizes[size].height,
        isFocused && 'scale-110 z-10'
      )}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      onClick={() => onPress(content)}
      tabIndex={-1}
    >
      <img
        src={content.thumbnail_url}
        alt={content.title}
        className="w-full h-full object-cover rounded-lg"
      />

      {showLock && (
        <div className="absolute top-2 right-2 bg-black/70 p-2 rounded-full">
          <Icon name="Lock" size={16} className="text-white" />
        </div>
      )}

      {isFocused && onInfoPress && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInfoPress(content);
          }}
          className="absolute bottom-2 right-2 bg-accent-500 text-white p-2 rounded-full"
        >
          <Icon name="Info" size={16} />
        </button>
      )}

      {isFocused && (
        <div className="absolute inset-0 border-2 border-accent-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default ContentCard;
