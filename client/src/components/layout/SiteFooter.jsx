import React from 'react';
import { Link } from 'react-router-dom';
import { HandHeart, Heart, ShieldCheck, Sparkles, Mail, Github, Twitter } from 'lucide-react';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-400 flex items-center justify-center text-white shadow-md">
                <HandHeart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">HelpRoster</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Connecting passionate individuals with meaningful community initiatives. Verified
              organizations, accountable hours, and tangible social impact.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Column: Discover */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Discover
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/opportunities" className="hover:text-white transition-colors">
                  Volunteer Opportunities
                </Link>
              </li>
              <li>
                <Link to="/organizations" className="hover:text-white transition-colors">
                  Verified Organizations
                </Link>
              </li>
              <li>
                <Link to="/opportunities?filter=remote" className="hover:text-white transition-colors">
                  Remote & Virtual Roles
                </Link>
              </li>
              <li>
                <Link to="/register?role=volunteer" className="hover:text-white transition-colors">
                  Become a Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Organizations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Organizations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/register?role=organization" className="hover:text-white transition-colors">
                  Register Non-Profit
                </Link>
              </li>
              <li>
                <Link to="/about#how-it-works" className="hover:text-white transition-colors">
                  How Verification Works
                </Link>
              </li>
              <li>
                <Link to="/about#volunteer-hours" className="hover:text-white transition-colors">
                  Hours Tracking & Audits
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Partner Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Platform & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us & Mission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Privacy Policy (v1.0)
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            &copy; {currentYear} HelpRoster Platform. Built with integrity for resilient communities.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span>Powered by Clean Relational MySQL & React</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-brand-400 font-medium">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
