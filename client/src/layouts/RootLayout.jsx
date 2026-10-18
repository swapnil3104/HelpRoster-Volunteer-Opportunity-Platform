import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  HandHeart,
  Menu,
  X,
  Heart,
  ShieldCheck,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Organizations', path: '/organizations' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const activeLinkClass = ({ isActive }) =>
    isActive
      ? 'text-brand-600 font-semibold'
      : 'text-slate-600 hover:text-brand-600 font-medium transition-colors';

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

  return (
    <div className="flex flex-col min-h-screen bg-page">
      {/* Top Banner / Announcement */}
      <div className="bg-brand-50 border-b border-brand-100 text-brand-800 text-xs py-1.5 px-4 text-center">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          HelpRoster Platform — Connecting Passion with Purpose Across Communities
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
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
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className={activeLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Action Buttons or User Dropdown */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {initials}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-slate-800 leading-tight">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-[10px] text-brand-600 uppercase tracking-wider font-bold">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {user.email}
                        </p>
                        <p className="text-[11px] text-slate-500 capitalize">
                          Role: {user.role}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div className="text-xs truncate">
                  <p className="font-bold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium"
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </NavLink>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Site Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <HandHeart className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white">HelpRoster</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering volunteers and community organizations with modern tools to discover opportunities, coordinate applications, and record verified social impact.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Non-Profit Partners</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Platform
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/opportunities" className="hover:text-white transition-colors">Browse Opportunities</Link></li>
                <li><Link to="/organizations" className="hover:text-white transition-colors">Organization Directory</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Join as Volunteer</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register Organization</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Resources
              </h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About HelpRoster</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Support & Help</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                System Status
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                HelpRoster API v1.0.0 is operating normally. All services monitored 24/7.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>API Status: Online</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} HelpRoster. All rights reserved.</p>
            <div className="flex items-center gap-1 mt-4 sm:mt-0">
              <span>Crafted for social impact with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
