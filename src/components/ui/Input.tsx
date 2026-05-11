import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string; // Nome do icone do bootstrap, ex: 'bi-person'
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[12px] font-medium text-content-main">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <i className={`bi ${icon} absolute left-[14px] text-[16px] text-content-secondary`}></i>
        )}
        <input
          id={inputId}
          className={`
            h-[38px] w-full rounded-lg bg-background-secondary 
            border border-border-input text-[14px] text-content-main
            transition-all duration-200 ease-in-out
            placeholder:text-[rgba(255,255,255,0.28)]
            focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(45,140,99,0.15)]
            hover:border-[rgba(255,255,255,0.10)]
            ${icon ? 'pl-[40px] pr-[14px]' : 'px-[14px]'}
          `}
          {...props}
        />
      </div>
    </div>
  );
};
