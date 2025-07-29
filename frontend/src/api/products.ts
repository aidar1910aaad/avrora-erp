import { productsApi } from '../lib/api-client';
import type { Product, CreateProductData, TableData } from '../types';


export const productsService = {
  async getAll(): Promise<TableData<Product>> {
    try {
      const result = await productsApi.get<TableData<Product>>('/table');
      console.log('Products API result:', result);
      console.log('Result type:', typeof result);
      console.log('Is object:', typeof result === 'object');
      return result || { columns: [], rows: [] };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { columns: [], rows: [] };
    }
  },


  async create(productData: CreateProductData): Promise<Product> {
    try {
      console.log('Creating product with data:', productData);
      const result = await productsApi.post<Product>('/table', productData);
      console.log('Product creation result:', result);
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
};

export type { Product, CreateProductData }; 