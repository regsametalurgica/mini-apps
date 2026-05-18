import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  disabled,
  isLoading,
  ...props 
}) => {
  const baseStyles = 'h-[38px] rounded-[999px] font-medium text-[13px] px-6 transition-all duration-200 ease-in-out flex items-center justify-center';
  
  const variants = {
    primary: `bg-primary text-white hover:bg-primary-hover active:bg-primary-active border-none`,
    secondary: `bg-transparent text-white border border-border-main hover:bg-background-tertiary`,
  };

  const disabledStyles = 'bg-[#1F1F1F] text-content-disabled cursor-not-allowed hover:bg-[#1F1F1F] active:bg-[#1F1F1F]';

  const appliedStyles = (disabled || isLoading)
    ? `${baseStyles} ${disabledStyles} ${className}` 
    : `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <button 
      className={appliedStyles} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </div>
      ) : children}
    </button>
  );
};
