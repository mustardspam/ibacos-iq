
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInspection } from '@/contexts/InspectionContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Home, FileText, User, LogOut, Shield, ClipboardList, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { user, profile, logout } = useAuth();
  const { setCurrentInspection } = useInspection();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInspectionClick = () => {
    setCurrentInspection(null);
    navigate('/inspection');
  };

  const isViewer = profile?.role === 'viewer';
  const isAdmin = profile?.role === 'admin';

  const navItems = isViewer
    ? [{ path: '/reports', label: 'Reports', icon: FileText, onClick: () => navigate('/reports') }]
    : [
        { path: '/', label: 'Dashboard', icon: Home, onClick: () => navigate('/') },
        { path: '/inspection', label: 'Inspection', icon: FileText, onClick: handleInspectionClick },
        { path: '/audits', label: 'Audits', icon: ClipboardList, onClick: () => navigate('/audits') },
        { path: '/reports', label: 'Reports', icon: FileText, onClick: () => navigate('/reports') },
        ...(isAdmin
          ? [{ path: '/admin', label: 'Admin', icon: Shield, onClick: () => navigate('/admin') }]
          : []),
      ];

  const close = () => setMobileOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">IQ</span>
            </div>
            <span className="font-bold text-gray-900 text-sm md:text-base">IbacosIQ</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/audits' && location.pathname.startsWith('/audits'));
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={item.onClick}
                  className={isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right side: user menu + mobile hamburger */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline text-sm">{profile?.name || user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/audits' && location.pathname.startsWith('/audits'));
              return (
                <button
                  key={item.path}
                  onClick={() => { item.onClick(); close(); }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t mt-1 pt-1">
              <div className="px-4 py-2 text-xs text-gray-400">{profile?.name || user?.email}</div>
              <button
                onClick={() => { handleLogout(); close(); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
