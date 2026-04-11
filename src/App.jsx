import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/hooks/useAuth.jsx';
import { CartProvider } from './features/sales/hooks/useCart.jsx';
import { ToastProvider } from './components/ui/toast';
import { ThemeProvider } from './components/theme-provider';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './features/auth/pages/LoginPage';
import AdminLoginPage from './features/auth/pages/AdminLoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

// ── Lazy-loaded pages (each becomes its own JS chunk) ───────────────────────
const LandingPage            = lazy(() => import('./pages/public/LandingPage'));
const CatalogPage            = lazy(() => import('./pages/public/CatalogPage'));
const ProductDetailPage      = lazy(() => import('./pages/public/ProductDetailPage'));
const TrackingPage           = lazy(() => import('./pages/public/TrackingPage'));
const CheckoutPage           = lazy(() => import('./pages/public/CheckoutPage'));
const CustomerDashboard      = lazy(() => import('./pages/public/CustomerDashboard'));
const CartDrawer             = lazy(() => import('./pages/public/components/CartDrawer'));
const DashboardPage          = lazy(() => import('./pages/admin/DashboardPage'));
const ClientsPage            = lazy(() => import('./features/clients/pages/ClientsPage.jsx'));
const EmployeesPage          = lazy(() => import('./features/employees/pages/EmployeesPage.jsx'));
const RolesPage              = lazy(() => import('./features/roles/pages/RolesPage.jsx'));
const ProductsPage           = lazy(() => import('./features/products/pages/ProductsPage.jsx'));
const CategoriesPage         = lazy(() => import('./features/categories/pages/CategoriesPage.jsx'));
const ProvidersPage          = lazy(() => import('./features/providers/pages/ProvidersPage.jsx'));
const InventoryMovementsPage = lazy(() => import('./features/products/pages/InventoryMovementsPage.jsx'));
const TechnicalServicesPage  = lazy(() => import('./features/technical-services/pages/TechnicalServicesPage.jsx'));
const AdminServicesPage      = lazy(() => import('./features/technical-services/pages/AdminServicesPage.jsx'));
const ServiceCatalogPage     = lazy(() => import('./features/technical-services/pages/ServiceCatalogPage.jsx'));
const KanbanPage             = lazy(() => import('./features/technical-services/pages/KanbanPage.jsx'));
const POSPage                = lazy(() => import('./features/sales/pages/POSPage.jsx'));
const SalesHistoryPage       = lazy(() => import('./features/sales/pages/SalesHistoryPage.jsx'));
const PendingSalesPage       = lazy(() => import('./features/sales/pages/PendingSalesPage.jsx'));
const CompanyInfoPage        = lazy(() => import('./features/company/pages/CompanyInfoPage.jsx'));
const PaymentMethodsPage     = lazy(() => import('./features/company/pages/PaymentMethodsPage.jsx'));
const DeliveryConfigPage     = lazy(() => import('./features/company/pages/DeliveryConfigPage.jsx'));
const CierresPage            = lazy(() => import('./features/finance/pages/CierresPage.jsx'));
const AuditLogsPage          = lazy(() => import('./features/audit/pages/AuditLogsPage.jsx'));

// ── Page-transition skeleton ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-48 rounded bg-slate-100 dark:bg-slate-700" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

// ── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (user) {
    if (user.role === 'CLIENTE') return <Navigate to="/mi-cuenta" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
};

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ToastProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <CartDrawer />
                <Routes>
                  {/* Public Access Tracking & Store */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/catalogo" element={<CatalogPage />} />
                  <Route path="/producto/:id" element={<ProductDetailPage />} />
                  <Route path="/tracking/:token" element={<TrackingPage />} />

                  {/* Public Routes */}
                  <Route element={<PublicRoute />}>
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/staff-login" element={<AdminLoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                  </Route>

                  {/* Customer Portal Protected Routes */}
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/mi-cuenta" element={<CustomerDashboard />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard"              element={<DashboardPage />} />
                      <Route path="products"               element={<ProductsPage />} />
                      <Route path="categories"             element={<CategoriesPage />} />
                      <Route path="providers"              element={<ProvidersPage />} />
                      <Route path="inventory/movements"    element={<InventoryMovementsPage />} />
                      <Route path="technical-services"     element={<TechnicalServicesPage />} />
                      <Route path="technical-services/kanban" element={<KanbanPage />} />
                      <Route path="service-catalog"        element={<ServiceCatalogPage />} />
                      <Route path="admin-services"         element={<AdminServicesPage />} />
                      <Route path="sales"                  element={<SalesHistoryPage />} />
                      <Route path="sales/pending"          element={<PendingSalesPage />} />
                      <Route path="pos"                    element={<POSPage />} />
                      <Route path="customers"              element={<ClientsPage />} />
                      <Route path="employees"              element={<EmployeesPage />} />
                      <Route path="roles"                  element={<RolesPage />} />
                      <Route path="settings/empresa"       element={<CompanyInfoPage />} />
                      <Route path="settings/pagos"         element={<PaymentMethodsPage />} />
                      <Route path="settings/domicilios"    element={<DeliveryConfigPage />} />
                      <Route path="finance/cierres"        element={<CierresPage />} />
                      <Route path="audit"                  element={<AuditLogsPage />} />
                    </Route>
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
