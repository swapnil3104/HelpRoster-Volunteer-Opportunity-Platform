import React from 'react';
import { Target, Users2, Shield } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900">About HelpRoster</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          HelpRoster is built to bridge the gap between volunteers seeking purpose and organizations striving to make a tangible community impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 mb-2">Our Mission</h2>
          <p className="text-xs text-slate-600">Make community service discovery transparent, accountable, and accessible to everyone.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-teal-50 text-accent-500 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 mb-2">Trust & Safety</h2>
          <p className="text-xs text-slate-600">Every non-profit organization is verified by administrators before posting opportunities.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Users2 className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 mb-2">Verified Impact</h2>
          <p className="text-xs text-slate-600">Official tracking of volunteer service hours with milestone recognition badges.</p>
        </div>
      </div>
    </div>
  );
}
