import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Briefcase,
  FileText,
  Shield,
  Box,
  Layers,
  Truck,
  ChevronDown,
  Wrench,
  ClipboardList,
  Kanban,
  ShoppingCart,
  History,
  Receipt,
  Landmark,
  Building2,
  Clock,
  BarChart3,
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ModeToggle } from '../ui/mode-toggle';

// SidebarItem now hides itself if user lacks the required permission.
// Admins/Superadmins always see everything.
const SidebarItem = ({ icon: Icon, label, to, permission }) => {
  const { hasPermission } = useAuth();
  if (permission && !hasPermission(permission)) return null;
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
};

const SidebarGroup = ({ icon: Icon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Filter out hidden children (null returns from SidebarItem)
  const visibleChildren = React.Children.toArray(children).filter(Boolean);
  if (visibleChildren.length === 0) return null;  // hide empty groups

  // Auto-open if any child is active
  useEffect(() => {
    const hasActiveChild = visibleChildren.some(child => 
        location.pathname.startsWith(child.props?.to)
    );
    if (hasActiveChild) setIsOpen(true);
  }, [location.pathname]);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted text-muted-foreground hover:text-primary",
          isOpen && "text-primary"
        )}
      >
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            {label}
        </div>
        <ChevronDown 
            className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </button>
      {isOpen && (
        <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {children}
        </div>
      )}
    </div>
  );
};

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden border-r bg-muted/40 md:block sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="h-6 w-6" />
              <span className="">Tecnológicos GR</span>
            </NavLink>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 pt-2">
              <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              
              <SidebarGroup icon={ShoppingBag} label="Inventario">
                <SidebarItem to="/admin/products"            icon={Box}       label="Productos"   permission="productos:leer" />
                <SidebarItem to="/admin/categories"          icon={Layers}    label="Categorías"  permission="productos:leer" />
                <SidebarItem to="/admin/providers"           icon={Truck}     label="Proveedores" permission="productos:leer" />
                <SidebarItem to="/admin/inventory/movements" icon={BarChart3} label="Movimientos" permission="inventario:leer" />
              </SidebarGroup>

              <SidebarGroup icon={Wrench} label="Servicios Técnicos">
                <SidebarItem to="/admin/technical-services"        icon={Wrench}        label="Reparaciones"  permission="servicios:leer" />
                <SidebarItem to="/admin/technical-services/kanban" icon={Kanban}        label="Tablero Kanban" permission="servicios:leer" />
                <SidebarItem to="/admin/service-catalog"           icon={ClipboardList} label="Catálogo"       permission="servicios:catalogo" />
                {isAdmin() && <SidebarItem to="/admin/admin-services" icon={Shield}       label="Servicios Admin" />}
              </SidebarGroup>

              <SidebarGroup icon={ShoppingCart} label="Ventas">
                <SidebarItem to="/admin/pos"               icon={CreditCard} label="Punto de Venta"     permission="carrito:usar" />
                <SidebarItem to="/admin/sales"             icon={Receipt}    label="Historial de Ventas" permission="pedidos:leer" />
                <SidebarItem to="/admin/sales/pending"     icon={Clock}      label="Pendientes de Pago" permission="pedidos:leer" />
                <SidebarItem to="/admin/finance/cierres"   icon={DollarSign} label="Cierre de Caja"     permission="finanzas:cierre" />
              </SidebarGroup>

              <SidebarItem to="/admin/customers" icon={Users}     label="Clientes"        permission="clientes:leer" />
              <SidebarItem to="/admin/employees" icon={Briefcase} label="Empleados"       permission="empleados:leer" />
              <SidebarItem to="/admin/roles"     icon={Shield}    label="Roles y Permisos" permission="roles:leer" />

              <SidebarGroup icon={Settings} label="Configuración">
                <SidebarItem to="/admin/settings/empresa"    icon={Building2} label="Empresa"         permission="empresa:leer" />
                <SidebarItem to="/admin/settings/pagos"      icon={Landmark}  label="Métodos de Pago"  permission="empresa:editar" />
                <SidebarItem to="/admin/settings/domicilios" icon={Truck}     label="Domicilios"       permission="empresa:editar" />
              </SidebarGroup>

              {isAdmin() && (
                  <SidebarGroup icon={ShieldAlert} label="Seguridad">
                      <SidebarItem to="/admin/audit" icon={ShieldAlert} label="Auditoría" />
                  </SidebarGroup>
              )}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          {/* Mobile Menu Backdrop */}
          {isMobileMenuOpen && (
             <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs border-r bg-background p-6 shadow-lg sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                         <span className="font-bold text-lg">Menu</span>
                         <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-5 w-5"/>
                         </Button>
                    </div>
                     <nav className="grid gap-1 mt-6 text-sm font-medium overflow-y-auto max-h-[80vh]" onClick={() => setIsMobileMenuOpen(false)}>
                        <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />

                        <SidebarGroup icon={ShoppingBag} label="Inventario">
                          <SidebarItem to="/admin/products"            icon={Box}       label="Productos"   permission="productos:leer" />
                          <SidebarItem to="/admin/categories"          icon={Layers}    label="Categorías"  permission="productos:leer" />
                          <SidebarItem to="/admin/providers"           icon={Truck}     label="Proveedores" permission="productos:leer" />
                          <SidebarItem to="/admin/inventory/movements" icon={BarChart3} label="Movimientos" permission="inventario:leer" />
                        </SidebarGroup>

                        <SidebarGroup icon={Wrench} label="Servicios Técnicos">
                          <SidebarItem to="/admin/technical-services"        icon={Wrench}        label="Reparaciones"   permission="servicios:leer" />
                          <SidebarItem to="/admin/technical-services/kanban" icon={Kanban}        label="Tablero Kanban" permission="servicios:leer" />
                          <SidebarItem to="/admin/service-catalog"           icon={ClipboardList} label="Catálogo"        permission="servicios:catalogo" />
                          {isAdmin() && <SidebarItem to="/admin/admin-services" icon={Shield}       label="Servicios Admin" />}
                        </SidebarGroup>

                        <SidebarGroup icon={ShoppingCart} label="Ventas">
                          <SidebarItem to="/admin/pos"             icon={CreditCard} label="Punto de Venta"     permission="carrito:usar" />
                          <SidebarItem to="/admin/sales"           icon={Receipt}    label="Historial de Ventas" permission="pedidos:leer" />
                          <SidebarItem to="/admin/sales/pending"   icon={Clock}      label="Pendientes de Pago" permission="pedidos:leer" />
                          <SidebarItem to="/admin/finance/cierres" icon={DollarSign} label="Cierre de Caja"     permission="finanzas:cierre" />
                        </SidebarGroup>

                        <SidebarItem to="/admin/customers" icon={Users}     label="Clientes"        permission="clientes:leer" />
                        <SidebarItem to="/admin/employees" icon={Briefcase} label="Empleados"       permission="empleados:leer" />
                        <SidebarItem to="/admin/roles"     icon={Shield}    label="Roles y Permisos" permission="roles:leer" />

                        <SidebarGroup icon={Settings} label="Configuración">
                          <SidebarItem to="/admin/settings/empresa"    icon={Building2} label="Empresa"        permission="empresa:leer" />
                          <SidebarItem to="/admin/settings/pagos"      icon={Landmark}  label="Métodos de Pago" permission="empresa:editar" />
                          <SidebarItem to="/admin/settings/domicilios" icon={Truck}     label="Domicilios"     permission="empresa:editar" />
                        </SidebarGroup>

                        {isAdmin() && (
                            <SidebarGroup icon={ShieldAlert} label="Seguridad">
                                <SidebarItem to="/admin/audit" icon={ShieldAlert} label="Auditoría" />
                            </SidebarGroup>
                        )}
                     </nav>
                </div>
             </div>
          )}
          
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold md:text-2xl">Administración</h1>
          </div>
          <ModeToggle />
          {/* User avatar + role badge */}
          <div className="flex items-center gap-2">
            {user?.role && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {user.role}
              </span>
            )}
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary select-none cursor-default" title={user?.email}>
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
