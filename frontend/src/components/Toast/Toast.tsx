import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {

    setTimeout(() => setIsVisible(true), 10);


    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: FaCheck,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-600'
    },
    error: {
      icon: FaTimes,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-600'
    },
    warning: {
      icon: FaExclamationTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-600'
    },
    info: {
      icon: FaInfoCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-600'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        mb-4 flex items-start space-x-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 transform
        ${config.bgColor} ${config.borderColor}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? '-translate-x-full' : ''}
      `}
    >
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.titleColor}`}>
          {title}
        </p>
        {message && (
          <p className={`mt-1 text-sm ${config.messageColor}`}>
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className={`flex-shrink-0 rounded-full p-1 hover:bg-black hover:bg-opacity-10 transition-colors ${config.iconColor}`}
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast; 