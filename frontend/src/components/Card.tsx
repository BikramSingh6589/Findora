import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div 
      className={`bg-surface-container-lowest dark:bg-surface-container rounded-[20px] p-6 shadow-card dark:shadow-lg ${hoverable ? 'hover:scale-[1.03] hover:shadow-card-hover dark:hover:shadow-lg transition-all duration-200 cursor-pointer' : ''} transition-colors duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
