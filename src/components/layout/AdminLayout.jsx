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
  ClipboardList
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../features/auth/hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, to }) => (
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

const SidebarGroup = ({ icon: Icon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Auto-open if any child is active
  useEffect(() => {
    // Check if any child path matches current location
    const hasActiveChild = React.Children.toArray(children).some(child => {
        return location.pathname.startsWith(child.props.to);
    });
    if (hasActiveChild) {
        setIsOpen(true);
    }
  }, [location.pathname, children]);

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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
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
                <SidebarItem to="/admin/products" icon={Box} label="Productos" />
                <SidebarItem to="/admin/categories" icon={Layers} label="Categorías" />
                <SidebarItem to="/admin/providers" icon={Truck} label="Proveedores" />
              </SidebarGroup>

              <SidebarGroup icon={Wrench} label="Servicios Técnicos">
                <SidebarItem to="/admin/technical-services" icon={Wrench} label="Reparaciones" />
                <SidebarItem to="/admin/service-catalog" icon={ClipboardList} label="Catálogo" />
              </SidebarGroup>

              <SidebarItem to="/admin/sales" icon={CreditCard} label="Ventas" />
              <SidebarItem to="/admin/customers" icon={Users} label="Clientes" />
              <SidebarItem to="/admin/employees" icon={Briefcase} label="Empleados" />
              <SidebarItem to="/admin/roles" icon={Shield} label="Roles y Permisos" />
              <SidebarItem to="/admin/settings" icon={Settings} label="Configuración" />
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
                     <nav className="grid gap-2 mt-8 text-lg font-medium">
                        <SidebarItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem to="/admin/products" icon={ShoppingBag} label="Productos" />
                        <SidebarItem to="/admin/sales" icon={CreditCard} label="Ventas" />
                        <SidebarItem to="/admin/customers" icon={Users} label="Clientes" />
                        <SidebarItem to="/admin/employees" icon={Briefcase} label="Empleados" />
                     </nav>
                </div>
             </div>
          )}
          
          <div className="w-full flex-1">
             {/* Header interactions like search or user profile dropdown could go here */}
             <h1 className="text-lg font-semibold md:text-2xl">Administración</h1>
          </div>
          <Button className="rounded-full" size="icon" variant="secondary">
            <span className="sr-only">Toggle user menu</span>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                AD
            </div>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
