import { customersApi } from '../lib/api-client';
import type { Customer, CreateCustomerData, TableData } from '../types';


export const customersService = {
  // Получить всех клиентов
  async getAll(): Promise<TableData<Customer>> {
    try {
      const result = await customersApi.get<TableData<Customer>>('/table');
      return result || { columns: [], rows: [] };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { columns: [], rows: [] };
    }
  },


  async create(customerData: CreateCustomerData): Promise<Customer> {
    try {
      return await customersApi.post<Customer>('/table', customerData);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
};

// ===== ЭКСПОРТ ТИПОВ =====
export type { Customer, CreateCustomerData }; 