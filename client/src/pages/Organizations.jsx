import React from 'react';
import { Building2, ShieldCheck, MapPin } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function Organizations() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Partner Organizations</h1>
        <p className="text-slate-600 mt-2">
          Discover verified non-profits, charities, and community groups coordinating impactful projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">City Harvest Alliance</h2>
                <span className="text-xs text-slate-500">Registered 501(c)(3) Non-Profit</span>
              </div>
            </div>
            <StatusBadge status="verified" label="Admin Verified" />
          </div>
          <p className="text-sm text-slate-600">
            Dedicated to eliminating food waste and feeding food-insecure families across urban metro areas.
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Metro Region</span>
            <span className="text-brand-600 font-medium">3 Active Opportunities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
