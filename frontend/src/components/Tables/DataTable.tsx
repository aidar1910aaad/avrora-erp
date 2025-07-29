import React, { useState, useMemo } from 'react';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaFilter,
  FaPlus
} from 'react-icons/fa';

export type Column<T = Record<string, unknown>> = {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
};

export type ApiColumn = {
  label: string;
  field: string;
  type: string;
};

export type DataTableProps<T = Record<string, unknown>> = {
  columns?: Column<T>[];
  apiColumns?: ApiColumn[];
  data: T[];
  loading?: boolean;
  pageSizeOptions?: number[];
  title?: string;
  subtitle?: string;
  onAdd?: () => void;
  addButtonText?: string;
};

const DataTable = <T extends Record<string, unknown>>({
  columns: propColumns,
  apiColumns,
  data,
  loading = false,
  pageSizeOptions = [5, 10, 20, 50],
  title,
  subtitle,
  onAdd,
  addButtonText = "Добавить"
}: DataTableProps<T>) => {
  const safeData = Array.isArray(data) ? data : [];
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<number>>(new Set());


  const columns = useMemo((): Column<T>[] => {
    if (propColumns) return propColumns as Column<T>[];
    
    if (apiColumns) {
      return apiColumns.map(col => ({
        key: col.field,
        label: col.label,
        sortable: true,
        render: getRenderFunction(col.type, col.field),
        width: getColumnWidth(col.type)
      }));
    }
    
    return [];
  }, [propColumns, apiColumns]);


  function getRenderFunction(type: string, field: string): ((value: unknown, row: T) => React.ReactNode) | undefined {
    switch (type) {
      case 'BooleanField':
        return (value: unknown) => (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800 ring-1 ring-green-200' : 'bg-red-100 text-red-800 ring-1 ring-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {value ? 'Да' : 'Нет'}
          </span>
        );
      
      case 'DateTimeField':
        return (value: unknown) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {new Date(value as string).toLocaleDateString('ru-RU')}
            </div>
            <div className="text-gray-500">
              {new Date(value as string).toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        );
      
      case 'EmailField':
        return (value: unknown) => (
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {String(value)}
          </a>
        );
      
      case 'DecimalField':
        if (field.includes('price') || field.includes('cost') || field.includes('amount')) {
          return (value: unknown) => (
            <div className="font-semibold text-green-600">
              {Number(value).toLocaleString('ru-RU')} ₽
            </div>
          );
        }
        return (value: unknown) => (
          <div className="font-medium">
            {Number(value).toLocaleString('ru-RU')}
          </div>
        );
      
      case 'IntegerField':
        if (field.includes('price') || field.includes('cost')) {
          return (value: unknown) => (
            <div className="font-semibold text-green-600">
              {Number(value).toLocaleString('ru-RU')} ₽
            </div>
          );
        }
        if (field.includes('quantity') || field.includes('stock') || field.includes('count')) {
          return (value: unknown) => (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              Number(value) > 10 ? 'bg-green-100 text-green-800' : 
              Number(value) > 5 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {String(value)} шт.
            </span>
          );
        }
        return undefined;
      
      default:
        return undefined;
    }
  }

  function getColumnWidth(type: string): string | undefined {
    switch (type) {
      case 'IntegerField':
        return '80px';
      case 'BooleanField':
        return '120px';
      case 'DateTimeField':
        return '150px';
      default:
        return undefined;
    }
  }

  const filteredData = useMemo(() => {
    let filtered = safeData;
    if (search) {
      filtered = filtered.filter(row =>
        columns.some(col =>
          String(row[col.key] ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      );
    }
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        const aStr = String(aValue ?? '');
        const bStr = String(bValue ?? '');
        
        if (aStr === bStr) return 0;
        if (sortOrder === 'asc') return aStr > bStr ? 1 : -1;
        return aStr < bStr ? 1 : -1;
      });
    }
    return filtered;
  }, [safeData, search, sortKey, sortOrder, columns]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(pagedData.map((_, idx) => idx)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectRow = (idx: number, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) next.add(idx);
      else next.delete(idx);
      return next;
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) return <FaSort className="opacity-40" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
            {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus className="w-4 h-4" />
              {addButtonText}
            </button>
          )}
        </div>
      )}


      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              placeholder="Поиск по таблице..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Показать:</span>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {pageSizeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>


            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              <FaFilter className="h-4 w-4" />
              Фильтры
            </button>
          </div>
        </div>


        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Показано <span className="font-semibold text-gray-900">{pagedData.length}</span> из{' '}
            <span className="font-semibold text-gray-900">{filteredData.length}</span> записей
          </div>
          {selected.size > 0 && (
            <div className="text-blue-600 font-medium">
              Выбрано: {selected.size}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    checked={selected.size === pagedData.length && pagedData.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-200 transition-colors duration-150' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <span className="w-4 h-4 flex items-center justify-center">
                          {getSortIcon(column.key)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FaSearch className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных</h3>
                      <p className="text-gray-500">По вашему запросу ничего не найдено</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                      selected.has(idx) ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        checked={selected.has(idx)}
                        onChange={e => handleSelectRow(idx, e.target.checked)}
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200 group">
                          <FaEye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-all duration-200 group">
                          <FaEdit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200 group">
                          <FaTrash className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Страница <span className="font-semibold">{page}</span> из{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) => (
                    <React.Fragment key={idx}>
                      {pageNum === '...' ? (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => setPage(pageNum as number)}
                          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            page === pageNum
                              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-700 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
