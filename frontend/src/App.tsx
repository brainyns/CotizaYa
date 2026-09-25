import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import QuotesPage from './pages/QuotesPage';
import QuoteFormPage from './pages/QuoteFormPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import WorkOrderFormPage from './pages/WorkOrderFormPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/new" element={<QuoteFormPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />
        <Route path="/work-orders" element={<WorkOrdersPage />} />
        <Route path="/work-orders/new" element={<WorkOrderFormPage />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
        <Route path="/work-orders/:id/edit" element={<WorkOrderFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}