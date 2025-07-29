import React, { useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaToggleOn, 
  FaToggleOff, 
  FaBox, 
  FaDollarSign, 
  FaHashtag,
  FaSave
} from 'react-icons/fa';
import type { FormField, UniversalFormProps } from '../../types';

const UniversalForm: React.FC<UniversalFormProps> = ({ 
  fields, 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  submitText = 'Сохранить',
  cancelText = 'Отмена'
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'user': return <FaUser className="h-5 w-5 text-gray-400" />;
      case 'email': return <FaEnvelope className="h-5 w-5 text-gray-400" />;
      case 'box': return <FaBox className="h-5 w-5 text-gray-400" />;
      case 'dollar': return <FaDollarSign className="h-5 w-5 text-gray-400" />;
      case 'hashtag': return <FaHashtag className="h-5 w-5 text-gray-400" />;
      default: return null;
    }
  };

  const validateField = (field: FormField, value: unknown): string | undefined => {
    if (field.required && (!value || String(value).trim() === '')) {
      return field.validation?.message || `${field.label} обязательно для заполнения`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return 'Введите корректный email адрес';
      }
    }

    if (field.type === 'number' && value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Введите корректное число';
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `Минимальное значение: ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `Максимальное значение: ${field.validation.max}`;
      }
    }

    if (field.validation?.pattern && value) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(String(value))) {
        return field.validation.message || 'Неверный формат';
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const hasIcon = field.icon;

    const baseInputClasses = `block w-full pl-${hasIcon ? '10' : '3'} pr-3 py-3 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
      error ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white/80 focus:bg-white'
    }`;

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => handleInputChange(field.name, !value)}
              disabled={loading}
              className="flex items-center space-x-2 p-3 border rounded-xl hover:bg-gray-50 transition-colors"
            >
              {value ? <FaToggleOn className="h-5 w-5 text-green-500" /> : <FaToggleOff className="h-5 w-5 text-gray-400" />}
              <span className="text-sm font-medium">{value ? 'Активен' : 'Неактивен'}</span>
            </button>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseInputClasses}
            placeholder={field.placeholder}
            disabled={loading}
            rows={4}
          />
        );

      default:
        return (
          <div className="relative">
            {hasIcon && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getIcon(field.icon)}
              </div>
            )}
            <input
              type={field.type}
              value={String(value || '')}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={baseInputClasses}
              placeholder={field.placeholder}
              disabled={loading}
              min={field.type === 'number' ? field.validation?.min : undefined}
              max={field.type === 'number' ? field.validation?.max : undefined}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Сохранение...
            </>
          ) : (
            <>
              <FaSave className="w-4 h-4" />
              {submitText}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
        >
          {cancelText}
        </button>
      </div>
    </form>
  );
};

export default UniversalForm; 