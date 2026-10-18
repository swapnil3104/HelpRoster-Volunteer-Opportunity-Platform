import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Building2, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Database, 
  Server, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { checkServerHealth } from '../services/api';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const response = await checkServerHealth();
      setHealthStatus(response.data);
    } catch (err) {
      setHealthError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-page pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 text-brand-800 text-xs font-semibold mb-6 shadow-sm border border-brand-200">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            Phase 0 Initialized & Verified
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Connecting passionate volunteers with{' '}
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              verified community impact
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover meaningful volunteer opportunities, submit applications, log verified service hours, and help vetted community organizations thrive.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/opportunities">
              <Button size="lg" className="w-full sm:w-auto shadow-md shadow-brand-500/20">
                Explore Opportunities
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Register as Organization
              </Button>
            </Link>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Volunteers</div>
              <div className="text-xs text-slate-500 mt-1">Direct application tracking</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-accent-500 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">NGOs</div>
              <div className="text-xs text-slate-500 mt-1">Admin-verified organizations</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Hours</div>
              <div className="text-xs text-slate-500 mt-1">Logged & verified service</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900">Badges</div>
              <div className="text-xs text-slate-500 mt-1">Milestone recognition</div>
            </div>
          </div>
        </div>
      </section>

      {/* Backend & Database Health Status Card */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">System Integration Status</h2>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Live baseline verification between React Frontend, Express API, and MySQL
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frontend Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Frontend</span>
                <StatusBadge status="healthy" label="Online" />
              </div>
              <div className="text-sm font-medium text-slate-900">React + Vite SPA</div>
              <div className="text-xs text-slate-500 mt-1">Tailwind CSS Design Tokens</div>
            </div>

            {/* Backend API Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">REST API</span>
                <StatusBadge 
                  status={healthStatus ? 'healthy' : healthError ? 'error' : 'pending'} 
                  label={healthStatus ? 'Online' : healthError ? 'Offline' : 'Checking'} 
                />
              </div>
              <div className="text-sm font-medium text-slate-900">Node.js + Express</div>
              <div className="text-xs text-slate-500 mt-1">
                {healthStatus?.version ? `API v${healthStatus.version} on /api/v1` : 'Connecting...'}
              </div>
            </div>

            {/* Database Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Database</span>
                <StatusBadge 
                  status={healthStatus?.database?.connected ? 'healthy' : 'pending'} 
                  label={healthStatus?.database?.connected ? 'Connected' : 'Configured'} 
                />
              </div>
              <div className="text-sm font-medium text-slate-900">MySQL (mysql2)</div>
              <div className="text-xs text-slate-500 mt-1">
                {healthStatus?.database?.connected ? 'Pool Active & Pinged' : 'Awaiting Connection'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">How HelpRoster Works</h2>
          <p className="mt-3 text-slate-600">
            A transparent workflow designed for volunteers and community organizations alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Discover Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Search vetted listings by cause, skills, date, and location. Find where your talents make the biggest difference.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Apply & Get Verified</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Submit your interest with one click. Organizations review applications and coordinate directly through the platform.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Log Hours & Earn Badges</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Record your volunteer service hours for official verification, track total impact, and unlock community recognition badges.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
