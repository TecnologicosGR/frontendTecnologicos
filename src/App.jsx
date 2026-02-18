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
import TechnicalServicesPage from './features/technical-services/pages/TechnicalServicesPage.jsx';
import ServiceCatalogPage from './features/technical-services/pages/ServiceCatalogPage.jsx';


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
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="providers" element={<ProvidersPage />} />
                    <Route path="technical-services" element={<TechnicalServicesPage />} />
                    <Route path="service-catalog" element={<ServiceCatalogPage />} />
                    <Route path="sales" element={<PlaceholderDetails title="Ventas" />} />
                    <Route path="customers" element={<ClientsPage />} />
                    <Route path="employees" element={<EmployeesPage />} />
                    <Route path="roles" element={<RolesPage />} />
                    <Route path="settings" element={<PlaceholderDetails title="Configuración" />} />
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
