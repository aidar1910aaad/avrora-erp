import { z } from 'zod';
import type { ValidationError } from '../types';
import { useState, useCallback } from 'react';


export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Введите корректный email адрес');

export const nameSchema = z
  .string()
  .min(1, 'Имя обязательно')
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя не должно превышать 100 символов');

export const priceSchema = z
  .string()
  .min(1, 'Цена обязательна')
  .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Цена должна быть положительным числом',
  });

export const quantitySchema = z
  .number()
  .min(0, 'Количество не может быть отрицательным')
  .max(999999, 'Количество не может превышать 999999');

export const customerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  is_active: z.boolean().default(true),
});

export const productSchema = z.object({
  name: nameSchema,
  price: priceSchema,
  quantity: quantitySchema,
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;


export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = result.error.errors.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code,
  }));

  return { success: false, errors };
}

export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | undefined {
  return errors.find(error => error.field === fieldName)?.message;
}


export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback(() => {
    const result = validateForm(schema, data);
    
    if (result.success) {
      setErrors([]);
      return { success: true, data: result.data };
    } else {
      setErrors(result.errors);
      return { success: false, errors: result.errors };
    }
  }, [schema, data]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }));
    

    setErrors(prev => prev.filter(error => error.field !== String(field)));
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  }, [errors]);

  return {
    data,
    errors,
    validate,
    setFieldValue,
    getFieldError,
    setData,
  };
} 