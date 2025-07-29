import { Routes, Route, Navigate } from 'react-router-dom';
import CostumersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/customers" />} />
      <Route path="/customers" element={<CostumersPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
