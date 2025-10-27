import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/router/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignUpPage } from './features/auth/pages/SignUpPage';
import { QuotationListPage } from './features/quotations/pages/QuotationListPage';
import { QuotationDetailPage } from './features/quotations/pages/QuotationDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/quotations" replace />} />
          <Route path="/quotations" element={<QuotationListPage />} />
          <Route path="/quotations/:id" element={<QuotationDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;