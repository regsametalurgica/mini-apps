import { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full ${className || 'max-w-md'} bg-background-secondary rounded-[14px] border border-border-main p-6 shadow-2xl z-10 animate-in fade-in zoom-in duration-200`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-content-tertiary hover:text-content-main transition-colors"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        {children}
      </div>
    </div>
  );
};
