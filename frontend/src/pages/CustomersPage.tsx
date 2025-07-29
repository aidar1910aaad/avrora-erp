import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DataTable, { type ApiColumn } from '../components/Tables/DataTable';
import Modal from '../components/Modal/Modal';
import UniversalForm from '../components/Forms/UniversalForm';
import { useToast } from '../components/Toast';
import { useAsync } from '../hooks/useAsync';
import { customersService } from '../api';
import type { Customer, ApiError, TableData, CreateCustomerData, FormField } from '../types';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [columns, setColumns] = useState<ApiColumn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();


  const customerFields: FormField[] = [
    {
      name: 'name',
      label: 'Имя клиента',
      type: 'text',
      placeholder: 'Введите имя клиента',
      required: true,
      icon: 'user'
    },
    {
      name: 'email',
      label: 'Email адрес',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
      icon: 'email'
    },
    {
      name: 'is_active',
      label: 'Статус',
      type: 'boolean',
      required: false
    }
  ];


  const { execute: fetchCustomers, loading } = useAsync(
    async () => {
      return await customersService.getAll();
    },
    {
      onSuccess: (data: TableData<Customer>) => {
        console.log('CustomersPage onSuccess data:', data);
        console.log('Data type:', typeof data);
        console.log('Columns:', data.columns);
        console.log('Rows:', data.rows);
        setCustomers(data.rows || []);
        setColumns(data.columns || []);
      },
      onError: (error: ApiError) => {
        setCustomers([]);
        setColumns([]);
        showToast('error', 'Ошибка загрузки', error.message);
      }
    }
  );


  const { execute: createCustomer, loading: isCreating } = useAsync(
    async (customerData: CreateCustomerData) => {
      return await customersService.create(customerData);
    },
    {
      onSuccess: (newCustomer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        showToast('success', 'Клиент добавлен!', `Клиент "${newCustomer.name}" успешно создан`);
        setIsModalOpen(false);
      },
      onError: (error: ApiError) => {
        showToast('error', 'Ошибка!', error.message);
      }
    }
  );

  useEffect(() => {
    fetchCustomers().catch((error) => {

      console.log('Customers fetch error handled:', error);
    });
  }, []);

  const handleAddCustomer = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitCustomer = async (formData: Record<string, unknown>) => {
    console.log('Submitting customer data:', formData);
    try {
      await createCustomer(formData as unknown as CreateCustomerData);
    } catch (error) {

      console.log('Customer creation error handled:', error);
    }
  };

  return (
    <DashboardLayout>
      <DataTable 
        apiColumns={columns}
        data={customers} 
        loading={loading === 'loading'}
        title="Клиенты"
        subtitle="Управление клиентской базой"
        onAdd={handleAddCustomer}
        addButtonText="Добавить клиента"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Добавить нового клиента"
        size="md"
      >
        <UniversalForm
          fields={customerFields}
          initialData={{ name: '', email: '', is_active: true }}
          onSubmit={handleSubmitCustomer}
          onCancel={handleCloseModal}
          loading={isCreating === 'loading'}
          submitText="Добавить клиента"
          cancelText="Отмена"
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CustomersPage;
