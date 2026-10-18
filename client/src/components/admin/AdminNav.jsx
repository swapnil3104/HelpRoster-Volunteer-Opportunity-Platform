import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  MessageSquare,
  ScrollText,
  ShieldCheck
} from 'lucide-react';

const adminTabs = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Opportunities', path: '/admin/opportunities', icon: Compass },
  { label: 'Support Inquiries', path: '/admin/support', icon: MessageSquare },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText }
];

export default function AdminNav({ title, subtitle, action }) {
  return (
    <div className="mb-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title || 'Admin Workspace'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Staff Portal
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {subtitle || 'Manage platform verification gates, user accounts, content moderation, and security.'}
            </p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Admin Tab Navigation */}
      <nav className="flex items-center gap-2 overflow-x-auto py-3 border-b border-slate-200/80 -mb-px" aria-label="Admin Navigation Tabs">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
