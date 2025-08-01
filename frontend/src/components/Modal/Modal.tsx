import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">

      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-300 scale-100 opacity-100 border border-gray-200/50`}
          onClick={(e) => e.stopPropagation()}
        >
      
          <div className="flex items-center justify-between border-b border-gray-200/50 px-6 py-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          

          <div className="px-6 py-4 bg-white/90 backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 