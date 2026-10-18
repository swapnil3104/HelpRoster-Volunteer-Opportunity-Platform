import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HandHeart,
  Menu,
  X,
  Search,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Shield,
  Layers,
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const publicNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Organizations', path: '/organizations' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const activeLinkClass = ({ isActive }) =>
    isActive
      ? 'text-brand-600 font-semibold border-b-2 border-brand-600 py-1'
      : 'text-slate-600 hover:text-brand-600 font-medium transition-colors py-1';

  const mobileActiveLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-brand-50 text-brand-600 font-semibold block px-3 py-2.5 rounded-xl'
      : 'text-slate-700 hover:bg-slate-100 font-medium block px-3 py-2.5 rounded-xl transition-colors';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  // Role-specific workspace links
  const getRoleLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { label: 'Admin Portal', path: '/admin', icon: Shield },
        { label: 'Organizations Review', path: '/admin/organizations', icon: Building2 },
        { label: 'User Accounts', path: '/admin/users', icon: User },
        { label: 'Opportunity Moderation', path: '/admin/opportunities', icon: Layers },
        { label: 'Support Inquiries', path: '/admin/support', icon: FileCheck2 },
        { label: 'Audit Trail', path: '/admin/audit-logs', icon: Clock }
      ];
    }
    if (user.role === 'organization') {
      return [
        { label: 'Organization Dashboard', path: '/dashboard', icon: Layers },
        { label: 'My Opportunities', path: '/manage/opportunities', icon: FileCheck2 },
        { label: 'Volunteer Applicants', path: '/applicants', icon: User },
        { label: 'Review Hours', path: '/hours', icon: Clock }
      ];
    }
    // Volunteer
    return [
      { label: 'Volunteer Dashboard', path: '/dashboard', icon: Layers },
      { label: 'My Applications', path: '/applications', icon: FileCheck2 },
      { label: 'Volunteer Hours', path: '/hours', icon: Clock }
    ];
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus-ring rounded-xl p-1 -ml-1"
            aria-label="HelpRoster Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <HandHeart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                HelpRoster
              </span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold -mt-1">
                Volunteer Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {publicNavLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={activeLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons or User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Quick Button */}
            <Link
              to="/opportunities"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors focus-ring"
              aria-label="Search opportunities"
              title="Search opportunities"
            >
              <Search className="w-4 h-4" />
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus-ring"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-2">
                        <StatusBadge status={user.role} size="xs" />
                      </div>
                    </div>

                    {/* Role-specific workspace links */}
                    <div className="py-1">
                      {getRoleLinks().map((rLink) => {
                        const Icon = rLink.icon;
                        return (
                          <Link
                            key={rLink.path}
                            to={rLink.path}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            <span>{rLink.label}</span>
                          </Link>
                        );
                      })}
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Account Profile</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Join HelpRoster
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/opportunities"
              className="p-2 text-slate-600 hover:text-slate-900 focus-ring rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-ring"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-150">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {publicNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={mobileActiveLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                    {initials}
                  </div>
                  <div className="leading-tight flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <StatusBadge status={user.role} size="xs" />
                </div>

                <div className="space-y-1">
                  {getRoleLinks().map((rLink) => {
                    const Icon = rLink.icon;
                    return (
                      <Link
                        key={rLink.path}
                        to={rLink.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{rLink.label}</span>
                      </Link>
                    );
                  })}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Account Profile</span>
                  </Link>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:bg-red-50 justify-start"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
