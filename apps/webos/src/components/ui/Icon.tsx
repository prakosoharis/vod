import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  className?: string;
  [key: string]: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<any>;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <LucideIcon size={size} className={className} {...props} />;
};

export default Icon;
