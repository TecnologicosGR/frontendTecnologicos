import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth.jsx';
import { ToastProvider } from './components/ui/toast';
import { ThemeProvider } from './components/theme-provider';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './features/auth/pages/LoginPage';
import TrackingPage from './pages/public/TrackingPage';
import DashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './features/clients/pages/ClientsPage.jsx';
import EmployeesPage from './features/employees/pages/EmployeesPage.jsx';
import RolesPage from './features/roles/pages/RolesPage.jsx';
import ProductsPage from './features/products/pages/ProductsPage.jsx';
import CategoriesPage from './features/categories/pages/CategoriesPage.jsx';
import ProvidersPage from './features/providers/pages/ProvidersPage.jsx';
import InventoryMovementsPage from './features/products/pages/InventoryMovementsPage.jsx';
import TechnicalServicesPage from './features/technical-services/pages/TechnicalServicesPage.jsx';
import AdminServicesPage from './features/technical-services/pages/AdminServicesPage.jsx';
import ServiceCatalogPage from './features/technical-services/pages/ServiceCatalogPage.jsx';
import KanbanPage from './features/technical-services/pages/KanbanPage.jsx';
import POSPage from './features/sales/pages/POSPage.jsx';
import SalesHistoryPage from './features/sales/pages/SalesHistoryPage.jsx';
import PendingSalesPage from './features/sales/pages/PendingSalesPage.jsx';
import CompanyInfoPage from './features/company/pages/CompanyInfoPage.jsx';
import PaymentMethodsPage from './features/company/pages/PaymentMethodsPage.jsx';
import DeliveryConfigPage from './features/company/pages/DeliveryConfigPage.jsx';
import CierresPage from './features/finance/pages/CierresPage.jsx';
import AuditLogsPage from './features/audit/pages/AuditLogsPage.jsx';


// Simple wrapper to protect routes
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  
  return <Outlet />;
};

const PublicRoute = () => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    if (user) return <Navigate to="/admin/dashboard" replace />;
    return <Outlet />;
}

// Placeholder components
const PlaceholderDetails = ({ title }) => (
    <div className='flex flex-col gap-4'>
         <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[500px]">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">En Construcción</h3>
              <p className="text-sm text-muted-foreground">Pronto podrás gestionar {title.toLowerCase()} aquí.</p>
            </div>
         </div>
    </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ToastProvider>
          <BrowserRouter>
        <Routes>
            {/* Public Access Tracking */}
            <Route path="/tracking/:token" element={<TrackingPage />} />

            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/auth/login" element={<LoginPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="products"          element={<ProductsPage />} />
                    <Route path="categories"         element={<CategoriesPage />} />
                    <Route path="providers"          element={<ProvidersPage />} />
                    <Route path="inventory/movements" element={<InventoryMovementsPage />} />
                    <Route path="technical-services" element={<TechnicalServicesPage />} />
                    <Route path="technical-services/kanban" element={<KanbanPage />} />
                    <Route path="service-catalog" element={<ServiceCatalogPage />} />
                    <Route path="admin-services" element={<AdminServicesPage />} />
                    <Route path="sales"              element={<SalesHistoryPage />} />
                    <Route path="sales/pending"      element={<PendingSalesPage />} />
                    <Route path="pos"                element={<POSPage />} />
                    <Route path="customers" element={<ClientsPage />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="roles" element={<RolesPage />} />
                    <Route path="settings/empresa"    element={<CompanyInfoPage />} />
                    <Route path="settings/pagos"      element={<PaymentMethodsPage />} />
                    <Route path="settings/domicilios" element={<DeliveryConfigPage />} />
                    <Route path="finance/cierres"     element={<CierresPage />} />
                    <Route path="audit"               element={<AuditLogsPage />} />
                </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
