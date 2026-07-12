import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useNotificationStore } from '../../store/notificationStore';
import {
  ShoppingBag,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { items } = useCartStore();
  const { notifications, markAllAsRead } = useNotificationStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  // Helper to check if a nav link is active
  const isActiveLink = (path: string) => {
    if (path === '/jobs') return location.pathname === '/jobs' || location.pathname.startsWith('/jobs/');
    if (path === '/companies') return location.pathname === '/companies' || location.pathname.startsWith('/companies/');
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActiveLink(path)
        ? 'bg-[#eaeef2] text-fg-default'
        : 'text-fg-muted hover:text-fg-default hover:bg-[#eaeef2]'
    }`;

  const dashboardPath = user?.role === 'Employer' ? '/employer/dashboard' : user?.role === 'Admin' ? '/admin/dashboard' : '/candidate/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default bg-[#f6f8fa]">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 lg:px-6">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-fg-default font-semibold text-base">
            <span className='-mr-2 font-bold'>Linked</span>
            <img 
              src="/LinkedOut_Logo.png" 
              alt="LinkedOut Logo" 
              className="h-8 w-auto object-contain"
            />
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/jobs" className={navLinkClass('/jobs')}>
                Jobs
              </Link>
              <Link to={dashboardPath} className={navLinkClass(dashboardPath)}>
                Dashboard
              </Link>
              {user?.role !== 'Employer' && (
                <Link to="/companies" className={navLinkClass('/companies')}>
                  Companies
                </Link>
              )}
              {user?.role === 'Employer' && (
                <Link to="/employer/company" className={navLinkClass('/employer/company')}>
                  My Company
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          {isAuthenticated && user?.role === 'Candidate' && (
            <Link
              to="/cart"
              className="relative p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-[#eaeef2] transition-colors"
              data-tooltip="Saved Jobs"
            >
              <ShoppingBag size={18} />
              {items.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-[#eaeef2] transition-colors"
                data-tooltip="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-1 w-80 rounded-md border border-border-default bg-white shadow-lg z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
                    <h3 className="text-sm font-semibold text-fg-default">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setNotificationsOpen(false);
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-sm text-fg-muted">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-4 py-3 border-b border-border-muted last:border-0 hover:bg-canvas-subtle">
                          <p className="text-sm text-fg-default">{n.message}</p>
                          <span className="text-xs text-fg-muted">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Job (Employer shortcut) */}
          {isAuthenticated && user?.role === 'Employer' && (
            <Link
              to="/employer/jobs/create"
              className="p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-[#eaeef2] transition-colors"
              data-tooltip="Post a Job"
            >
              <PlusCircle size={18} />
            </Link>
          )}

          {/* Profile */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1 ml-1 p-1 rounded-md hover:bg-[#eaeef2] transition-colors"
                data-tooltip="Account menu"
              >
                <div className="h-7 w-7 rounded-full bg-[#dbeafe] border border-border-default flex items-center justify-center text-xs font-semibold text-primary overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <ChevronDown size={14} className="text-fg-muted" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-md border border-border-default bg-white shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-border-default">
                    <p className="text-sm font-semibold text-fg-default">{user?.name}</p>
                    <p className="text-xs text-fg-muted mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={dashboardPath}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-fg-default hover:bg-canvas-subtle transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard size={15} className="text-fg-muted" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-fg-default hover:bg-canvas-subtle transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UserIcon size={15} className="text-fg-muted" />
                      Your profile
                    </Link>
                  </div>
                  <div className="border-t border-border-default py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-fg-default hover:bg-canvas-subtle transition-colors"
                    >
                      <LogOut size={15} className="text-fg-muted" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:inline btn-secondary">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-[#eaeef2] transition-colors"
            data-tooltip="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-white px-4 py-3">
          <div className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <Link to="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-fg-default hover:bg-canvas-subtle" onClick={() => setMobileMenuOpen(false)}>
                  Jobs
                </Link>
                <Link
                  to={dashboardPath}
                  className="px-3 py-2 rounded-md text-sm font-medium text-fg-default hover:bg-canvas-subtle"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role !== 'Employer' && (
                  <Link to="/companies" className="px-3 py-2 rounded-md text-sm font-medium text-fg-default hover:bg-canvas-subtle" onClick={() => setMobileMenuOpen(false)}>
                    Companies
                  </Link>
                )}
                {user?.role === 'Employer' && (
                  <Link to="/employer/company" className="px-3 py-2 rounded-md text-sm font-medium text-fg-default hover:bg-canvas-subtle" onClick={() => setMobileMenuOpen(false)}>
                    My Company
                  </Link>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-2">
                <Link to="/login" className="w-full text-center btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                <Link to="/register" className="w-full text-center btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
