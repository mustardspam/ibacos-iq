
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInspection } from '@/contexts/InspectionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Home, FileText, User, LogOut, Shield, ClipboardList, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AwStarlightLogo from '@/components/AwStarlightLogo';

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
    <nav className="relative z-50 bg-white border-b" style={{ borderColor: 'hsl(220, 14%, 88%)' }}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <AwStarlightLogo variant="dark" className="h-9 w-auto" />
            <div className="hidden lg:flex flex-col leading-none border-l pl-3" style={{ borderColor: 'hsl(220, 14%, 85%)' }}>
              <span className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: 'hsl(215, 44%, 24%)' }}>IbacosIQ</span>
              <span className="text-[8px] tracking-widest uppercase font-light" style={{ color: 'hsl(220, 12%, 55%)' }}>ibacosiq.com</span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/audits' && location.pathname.startsWith('/audits'));
              return (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className="flex items-center gap-1.5 px-4 py-6 text-xs font-semibold tracking-widest uppercase transition-colors border-b-2"
                  style={
                    isActive
                      ? { color: 'hsl(215, 44%, 18%)', borderColor: 'hsl(215, 44%, 18%)' }
                      : { color: 'hsl(220, 12%, 50%)', borderColor: 'transparent' }
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side: user menu + mobile hamburger */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-xs hover:bg-gray-50"
                  style={{ color: 'hsl(220, 12%, 40%)' }}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline tracking-wide">{profile?.name || user?.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              className="md:hidden p-2 transition-colors hover:bg-gray-50 rounded"
              style={{ color: 'hsl(220, 12%, 40%)' }}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg" style={{ borderColor: 'hsl(220, 14%, 90%)' }}>
          <div className="py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/audits' && location.pathname.startsWith('/audits'));
              return (
                <button
                  key={item.path}
                  onClick={() => { item.onClick(); close(); }}
                  className="w-full flex items-center px-6 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors"
                  style={
                    isActive
                      ? { color: 'hsl(215, 44%, 18%)', backgroundColor: 'hsl(215, 44%, 96%)' }
                      : { color: 'hsl(220, 12%, 45%)' }
                  }
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t mt-1 pt-1" style={{ borderColor: 'hsl(220, 14%, 90%)' }}>
              <div className="px-6 py-2 text-[10px] tracking-widest uppercase" style={{ color: 'hsl(220, 12%, 60%)' }}>{profile?.name || user?.email}</div>
              <button
                onClick={() => { handleLogout(); close(); }}
                className="w-full flex items-center px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-red-600 hover:bg-red-50 transition-colors"
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
