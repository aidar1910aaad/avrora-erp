import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DataTable, { type ApiColumn } from '../components/Tables/DataTable';
import Modal from '../components/Modal/Modal';
import UniversalForm from '../components/Forms/UniversalForm';
import { useToast } from '../components/Toast';
import { useAsync } from '../hooks/useAsync';
import { productsService } from '../api';
import type { Product, ApiError, TableData, CreateProductData, FormField } from '../types';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<ApiColumn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();


  const productFields: FormField[] = [
    {
      name: 'name',
      label: 'Название товара',
      type: 'text',
      placeholder: 'Введите название товара',
      required: true,
      icon: 'box'
    },
    {
      name: 'price',
      label: 'Цена (₽)',
      type: 'text',
      placeholder: '1000.00',
      required: true,
      validation: {
        pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
        message: 'Введите корректную цену'
      },
      icon: 'dollar'
    },
    {
      name: 'quantity',
      label: 'Количество',
      type: 'number',
      placeholder: '0',
      required: true,
      validation: {
        min: 0,
        max: 999999
      },
      icon: 'hashtag'
    }
  ];


  const { execute: fetchProducts, loading } = useAsync(
    async () => {
      return await productsService.getAll();
    },
    {
      onSuccess: (data: TableData<Product>) => {
        console.log('ProductsPage onSuccess data:', data);
        console.log('Data type:', typeof data);
        console.log('Columns:', data.columns);
        console.log('Rows:', data.rows);
        setProducts(data.rows || []);
        setColumns(data.columns || []);
      },
      onError: (error: ApiError) => {
        setProducts([]);
        setColumns([]);
        showToast('error', 'Ошибка загрузки', error.message);
      }
    }
  );

  const { execute: createProduct, loading: isCreating } = useAsync(
    async (productData: CreateProductData) => {
      return await productsService.create(productData);
    },
    {
      onSuccess: (newProduct) => {
        setProducts(prev => [newProduct, ...prev]);
        showToast('success', 'Продукт добавлен!', `Продукт "${newProduct.name}" успешно создан`);
        setIsModalOpen(false);
      },
      onError: (error: ApiError) => {
        showToast('error', 'Ошибка!', error.message);
      }
    }
  );

  useEffect(() => {
    fetchProducts().catch((error) => {
      console.log('Products fetch error handled:', error);
    });
  }, []);

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitProduct = async (formData: Record<string, unknown>) => {
    console.log('Submitting product data:', formData);
    try {
      await createProduct(formData as unknown as CreateProductData);
    } catch (error) {

      console.log('Product creation error handled:', error);
    }
  };

  return (
    <DashboardLayout>
      <DataTable 
        apiColumns={columns}
        data={products} 
        loading={loading === 'loading'}
        title="Продукты"
        subtitle="Управление товарной базой"
        onAdd={handleAddProduct}
        addButtonText="Добавить продукт"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Добавить новый продукт"
        size="md"
      >
        <UniversalForm
          fields={productFields}
          initialData={{ name: '', price: '', quantity: 0 }}
          onSubmit={handleSubmitProduct}
          onCancel={handleCloseModal}
          loading={isCreating === 'loading'}
          submitText="Добавить товар"
          cancelText="Отмена"
        />
      </Modal>
    </DashboardLayout>
  );
};

export default ProductsPage;
