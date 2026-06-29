import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'btn-primary';
      break;
    case 'secondary':
      variantClasses = 'bg-transparent text-primary border border-primary hover:bg-primary/5 rounded-[16px] px-6 py-3 font-semibold transition-all duration-150';
      break;
    case 'danger':
      variantClasses = 'bg-danger text-white rounded-[16px] px-6 py-3 font-semibold hover:brightness-90 transition-all duration-150';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-text-secondary hover:text-primary hover:bg-surface-container rounded-[16px] px-4 py-2 font-medium transition-all duration-150';
      break;
  }

  return (
    <button className={`${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};
